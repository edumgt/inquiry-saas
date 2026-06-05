from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = 'bearer'


class LoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class UserBase(BaseModel):
    id: int
    email: str
    full_name: str
    company_name: str
    role: str
    tier: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class VehicleResponse(BaseModel):
    id: int
    vehicle_name: str
    tonnage: float
    max_weight_kg: float
    load_length_cm: float
    load_width_cm: float
    load_height_cm: float

    model_config = ConfigDict(from_attributes=True)


class TariffResponse(BaseModel):
    id: int
    origin: str
    destination_region: str
    vehicle_spec_id: int
    base_price_usd: float
    lcl_price_usd_per_cbm: float
    overweight_surcharge_usd_per_ton: float
    size_surcharge_pct: float

    model_config = ConfigDict(from_attributes=True)


class ExchangeRateResponse(BaseModel):
    currency: str
    rate_to_krw: float
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuoteCreateRequest(BaseModel):
    origin: str
    destination_region: str
    destination_address: str
    package_count: int = Field(gt=0)
    total_weight_kg: float = Field(gt=0)
    total_cbm: float = Field(gt=0)
    cargo_length_cm: float = Field(gt=0)
    cargo_width_cm: float = Field(gt=0)
    cargo_height_cm: float = Field(gt=0)


class QuoteParseRequest(BaseModel):
    raw_text: str = Field(min_length=10)


class QuoteParseResponse(BaseModel):
    origin: str
    destination_region: str
    destination_address: str
    package_count: int
    total_weight_kg: float
    total_cbm: float
    cargo_length_cm: float
    cargo_width_cm: float
    cargo_height_cm: float
    confidence: float
    legal_disclaimer: str


class QuoteResponse(BaseModel):
    id: int
    quote_no: str
    user_id: int
    origin: str
    destination_region: str
    destination_address: str
    package_count: int
    total_weight_kg: float
    total_cbm: float
    cargo_length_cm: float
    cargo_width_cm: float
    cargo_height_cm: float
    recommended_vehicle_id: int
    service_mode: str
    subtotal_usd: float
    surcharge_usd: float
    discount_usd: float
    final_usd: float
    final_krw: float
    pricing_breakdown: dict[str, Any]
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    total_quotes: int
    quotes_this_month: int
    avg_quote_usd: float
    lcl_ratio_pct: float
    latest_quotes: list[QuoteResponse]


class AlbaApplicationResponse(BaseModel):
    id: int
    job_id: int
    worker_name: str
    worker_contact: str
    note: str | None
    status: str
    worked_hours: float | None
    applied_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlbaJobResponse(BaseModel):
    id: int
    job_no: str
    title: str
    location: str
    job_date: str
    start_time: str
    end_time: str
    headcount: int
    wage_per_hour: int
    job_type: str
    description: str | None
    status: str
    created_by: int
    created_at: datetime
    applications: list[AlbaApplicationResponse] = []

    model_config = ConfigDict(from_attributes=True)


class AlbaJobCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    location: str = Field(min_length=2, max_length=200)
    job_date: str
    start_time: str
    end_time: str
    headcount: int = Field(ge=1)
    wage_per_hour: int = Field(ge=9860)
    job_type: str
    description: str | None = None


class AlbaJobUpdate(BaseModel):
    title: str | None = None
    location: str | None = None
    job_date: str | None = None
    start_time: str | None = None
    end_time: str | None = None
    headcount: int | None = None
    wage_per_hour: int | None = None
    job_type: str | None = None
    description: str | None = None
    status: str | None = None


class AlbaApplicationCreate(BaseModel):
    worker_name: str = Field(min_length=1, max_length=100)
    worker_contact: str = Field(min_length=1, max_length=50)
    note: str | None = None


class AlbaApplicationUpdate(BaseModel):
    status: str | None = None
    worked_hours: float | None = None


class AlbaDashboardSummary(BaseModel):
    total_jobs: int
    open_jobs: int
    total_applications: int
    accepted_applications: int
    total_settlement_krw: int
    recent_jobs: list[AlbaJobResponse]
