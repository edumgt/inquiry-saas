from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
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
from app.utils import generate_unique_job_no

router = APIRouter(prefix='/alba', tags=['alba'])


@router.get('/dashboard', response_model=AlbaDashboardSummary)
def alba_dashboard(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> AlbaDashboardSummary:
    total_jobs = db.query(func.count(AlbaJob.id)).scalar() or 0
    open_jobs = db.query(func.count(AlbaJob.id)).filter(AlbaJob.status == 'open').scalar() or 0
    total_applications = db.query(func.count(AlbaApplication.id)).scalar() or 0
    accepted_count = (
        db.query(func.count(AlbaApplication.id))
        .filter(AlbaApplication.status == 'accepted')
        .scalar()
        or 0
    )

    total_settlement = (
        db.query(
            func.coalesce(
                func.sum(AlbaJob.wage_per_hour * AlbaApplication.worked_hours),
                0,
            )
        )
        .select_from(AlbaApplication)
        .join(AlbaJob, AlbaJob.id == AlbaApplication.job_id)
        .filter(
            AlbaApplication.status == 'accepted',
            AlbaApplication.worked_hours.isnot(None),
        )
        .scalar()
    ) or 0

    recent_jobs = (
        db.query(AlbaJob).order_by(AlbaJob.created_at.desc()).limit(5).all()
    )

    return AlbaDashboardSummary(
        total_jobs=total_jobs,
        open_jobs=open_jobs,
        total_applications=total_applications,
        accepted_applications=accepted_count,
        total_settlement_krw=int(total_settlement),
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
    max_retries = 5
    for attempt in range(max_retries):
        job_no = generate_unique_job_no(db)
        job = AlbaJob(
            job_no=job_no,
            created_by=current_user.id,
            **payload.model_dump(),
        )
        try:
            db.add(job)
            db.commit()
            db.refresh(job)
            return job
        except IntegrityError:
            db.rollback()
            if attempt == max_retries - 1:
                raise HTTPException(status_code=500, detail='Failed to generate unique job number. Please retry.')

    raise HTTPException(status_code=500, detail='Failed to create job')


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
    current_user: User = Depends(get_current_user),
) -> list[AlbaApplicationResponse]:
    job = db.query(AlbaJob).filter(AlbaJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail='Job not found')
    if current_user.role != 'admin' and job.created_by != current_user.id:
        raise HTTPException(status_code=403, detail='Not allowed to view applications for this job')
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
    current_user: User = Depends(get_current_user),
) -> AlbaApplicationResponse:
    app = db.query(AlbaApplication).filter(AlbaApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail='Application not found')
    job = db.query(AlbaJob).filter(AlbaJob.id == app.job_id).first()
    if current_user.role != 'admin' and (not job or job.created_by != current_user.id):
        raise HTTPException(status_code=403, detail='Not allowed to modify applications for this job')
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(app, field, value)
    db.commit()
    db.refresh(app)
    return app
