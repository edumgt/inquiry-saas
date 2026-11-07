from datetime import UTC, datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


def generate_quote_no(sequence: int) -> str:
    date_part = datetime.now(UTC).strftime('%Y%m%d')
    return f'Q-{date_part}-{sequence:05d}'


def generate_unique_quote_no(db: 'Session') -> str:
    from app.models import Quote

    date_part = datetime.now(UTC).strftime('%Y%m%d')
    prefix = f'Q-{date_part}-'
    latest = (
        db.query(Quote)
        .filter(Quote.quote_no.like(f'{prefix}%'))
        .order_by(Quote.quote_no.desc())
        .first()
    )
    if latest and latest.quote_no.startswith(prefix):
        try:
            seq = int(latest.quote_no[len(prefix):]) + 1
        except ValueError:
            seq = 1
    else:
        seq = 1
    return f'{prefix}{seq:05d}'


def generate_unique_job_no(db: 'Session') -> str:
    from app.models import AlbaJob

    date_part = datetime.now(UTC).strftime('%y%m%d')
    prefix = f'ALB-{date_part}-'
    latest = (
        db.query(AlbaJob)
        .filter(AlbaJob.job_no.like(f'{prefix}%'))
        .order_by(AlbaJob.job_no.desc())
        .first()
    )
    if latest and latest.job_no.startswith(prefix):
        try:
            seq = int(latest.job_no[len(prefix):]) + 1
        except ValueError:
            seq = 1
    else:
        seq = 1
    return f'{prefix}{seq:04d}'
