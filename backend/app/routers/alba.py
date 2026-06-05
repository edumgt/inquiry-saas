from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user
from app.models import AlbaApplication, AlbaJob, User
from app.schemas import (
    AlbaApplicationCreate,
    AlbaApplicationResponse,
    AlbaApplicationUpdate,
    AlbaDashboardSummary,
    AlbaJobCreate,
    AlbaJobResponse,
    AlbaJobUpdate,
)

router = APIRouter(prefix='/alba', tags=['alba'])


def _gen_job_no(db: Session) -> str:
    count = db.query(func.count(AlbaJob.id)).scalar() or 0
    return f'ALB-{datetime.now(UTC).strftime("%y%m%d")}-{count + 1:04d}'


@router.get('/dashboard', response_model=AlbaDashboardSummary)
def alba_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AlbaDashboardSummary:
    total_jobs = db.query(func.count(AlbaJob.id)).scalar() or 0
    open_jobs = db.query(func.count(AlbaJob.id)).filter(AlbaJob.status == 'open').scalar() or 0
    total_applications = db.query(func.count(AlbaApplication.id)).scalar() or 0
    accepted = (
        db.query(AlbaApplication)
        .filter(AlbaApplication.status == 'accepted')
        .all()
    )
    accepted_count = len(accepted)

    total_settlement = 0
    for app in accepted:
        job = db.query(AlbaJob).filter(AlbaJob.id == app.job_id).first()
        if job and app.worked_hours:
            total_settlement += int(job.wage_per_hour * app.worked_hours)

    recent_jobs = (
        db.query(AlbaJob).order_by(AlbaJob.created_at.desc()).limit(5).all()
    )

    return AlbaDashboardSummary(
        total_jobs=total_jobs,
        open_jobs=open_jobs,
        total_applications=total_applications,
        accepted_applications=accepted_count,
        total_settlement_krw=total_settlement,
        recent_jobs=recent_jobs,
    )


@router.get('/jobs', response_model=list[AlbaJobResponse])
def list_jobs(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[AlbaJobResponse]:
    return db.query(AlbaJob).order_by(AlbaJob.created_at.desc()).all()


@router.post('/jobs', response_model=AlbaJobResponse, status_code=201)
def create_job(
    payload: AlbaJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AlbaJobResponse:
    job = AlbaJob(
        job_no=_gen_job_no(db),
        created_by=current_user.id,
        **payload.model_dump(),
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


@router.get('/jobs/{job_id}', response_model=AlbaJobResponse)
def get_job(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AlbaJobResponse:
    job = db.query(AlbaJob).filter(AlbaJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    return job


@router.patch('/jobs/{job_id}', response_model=AlbaJobResponse)
def update_job(
    job_id: int,
    payload: AlbaJobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AlbaJobResponse:
    job = db.query(AlbaJob).filter(AlbaJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    if current_user.role != 'admin' and job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return job


@router.delete('/jobs/{job_id}', status_code=204)
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    job = db.query(AlbaJob).filter(AlbaJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    if current_user.role != 'admin' and job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed')
    db.delete(job)
    db.commit()


@router.get('/jobs/{job_id}/applications', response_model=list[AlbaApplicationResponse])
def list_applications(
    job_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> list[AlbaApplicationResponse]:
    if not db.query(AlbaJob).filter(AlbaJob.id == job_id).first():
        raise HTTPException(status_code=404, detail='Job not found')
    return (
        db.query(AlbaApplication)
        .filter(AlbaApplication.job_id == job_id)
        .order_by(AlbaApplication.applied_at.desc())
        .all()
    )


@router.post('/jobs/{job_id}/applications', response_model=AlbaApplicationResponse, status_code=201)
def create_application(
    job_id: int,
    payload: AlbaApplicationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AlbaApplicationResponse:
    job = db.query(AlbaJob).filter(AlbaJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    if job.status != 'open':
        raise HTTPException(status_code=400, detail='Job is not open for applications')
    app = AlbaApplication(job_id=job_id, **payload.model_dump())
    db.add(app)
    db.commit()
    db.refresh(app)
    return app


@router.patch('/applications/{app_id}', response_model=AlbaApplicationResponse)
def update_application(
    app_id: int,
    payload: AlbaApplicationUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AlbaApplicationResponse:
    app = db.query(AlbaApplication).filter(AlbaApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail='Application not found')
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(app, field, value)
    db.commit()
    db.refresh(app)
    return app
