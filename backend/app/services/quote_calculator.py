from __future__ import annotations

import re
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.core.legal import PARSE_TEXT_DISCLAIMER
from app.models import ExchangeRate, TariffRate, User, VehicleSpec


TIER_DISCOUNTS = {
    'STANDARD': 0.0,
    'GOLD': 5.0,
    'VIP': 10.0,
}


@dataclass
class QuoteInput:
    origin: str
    destination_region: str
    total_weight_kg: float
    total_cbm: float
    cargo_length_cm: float
    cargo_width_cm: float
    cargo_height_cm: float


@dataclass
class QuoteCalculationResult:
    recommended_vehicle: VehicleSpec
    service_mode: str
    subtotal_usd: float
    surcharge_usd: float
    discount_usd: float
    final_usd: float
    final_krw: float
    pricing_breakdown: dict


def parse_cargo_text(raw_text: str) -> dict:
    text = raw_text.strip()
    lowered = text.lower()

    def _match(pattern: str, default: float) -> float:
        m = re.search(pattern, lowered)
        return float(m.group(1)) if m else default

    package_count = int(_match(r'(\d+(?:\.\d+)?)\s*(?:pkg|packages|boxes|box|ctns?|박스|개|상자|포장)', 1))

    # Weight: check ton first, then kg
    ton_m = re.search(r'(\d+(?:\.\d+)?)\s*(?:ton|tons|톤)', lowered)
    if ton_m:
        total_weight_kg = float(ton_m.group(1)) * 1000.0
    else:
        total_weight_kg = _match(r'(\d+(?:\.\d+)?)\s*(?:kg|kgs|킬로그램|키로|킬로)', 500.0)

    total_cbm = _match(r'(\d+(?:\.\d+)?)\s*(?:cbm|m3|m\^3|루베|입방미터)', 3.0)

    lwh = re.search(
        r'(\d+(?:\.\d+)?)\s*[x*×X]\s*(\d+(?:\.\d+)?)\s*[x*×X]\s*(\d+(?:\.\d+)?)\s*(?:cm|센티|센치)?',
        lowered,
    )
    if lwh:
        cargo_length_cm, cargo_width_cm, cargo_height_cm = map(float, lwh.groups())
    else:
        cargo_length_cm, cargo_width_cm, cargo_height_cm = 250.0, 150.0, 160.0

    # Determine origin
    origin = 'Busan Port'
    if re.search(r'(부산|busan)', lowered):
        origin = 'Busan Port'
    elif re.search(r'(인천항?|incheon)', lowered):
        origin = 'Incheon Port'

    # Determine destination region
    destination_region = 'Seoul Metro'
    if re.search(r'(대전|daejeon)', lowered):
        destination_region = 'Daejeon'
    elif re.search(r'(경기|수원|gyeonggi|suwon)', lowered):
        destination_region = 'Gyeonggi South'
    elif re.search(r'(인천|incheon)', lowered) and origin != 'Incheon Port':
        destination_region = 'Incheon'
    elif re.search(r'(서울|seoul)', lowered):
        destination_region = 'Seoul Metro'

    destination_address = 'Auto parsed destination address'
    for line in text.splitlines():
        line_s = line.strip()
        line_l = line_s.lower()
        if 'address' in line_l or '주소' in line_l:
            destination_address = line_s
            break
    else:
        for line in text.splitlines():
            line_s = line.strip()
            line_l = line_s.lower()
            if ',' in line_s or any(kw in line_s for kw in ['대로', '길', '동', '구']):
                if not re.search(r'(cbm|kg|pkg|boxes|박스|개)', line_l):
                    destination_address = line_s
                    break

    confidence = 0.62
    if lwh:
        confidence += 0.1
    if re.search(r'(cbm|kg|packages|pkg|박스|개|루베|톤|ctn|m3)', lowered):
        confidence += 0.15
    if re.search(r'(busan|incheon|부산|인천|서울|대전|경기)', lowered):
        confidence += 0.08
    confidence = min(round(confidence, 2), 0.95)

    return {
        'origin': origin,
        'destination_region': destination_region,
        'destination_address': destination_address,
        'package_count': package_count,
        'total_weight_kg': total_weight_kg,
        'total_cbm': total_cbm,
        'cargo_length_cm': cargo_length_cm,
        'cargo_width_cm': cargo_width_cm,
        'cargo_height_cm': cargo_height_cm,
        'confidence': confidence,
        'legal_disclaimer': PARSE_TEXT_DISCLAIMER,
    }


def _select_vehicle(cargo: QuoteInput, vehicles: list[VehicleSpec]) -> tuple[VehicleSpec, bool]:
    sorted_vehicles = sorted(vehicles, key=lambda v: (v.max_weight_kg, v.load_length_cm * v.load_width_cm * v.load_height_cm))

    for vehicle in sorted_vehicles:
        fits_weight = cargo.total_weight_kg <= vehicle.max_weight_kg
        fits_size = (
            cargo.cargo_length_cm <= vehicle.load_length_cm
            and cargo.cargo_width_cm <= vehicle.load_width_cm
            and cargo.cargo_height_cm <= vehicle.load_height_cm
        )
        if fits_weight and fits_size:
            return vehicle, False

    return sorted_vehicles[-1], True


def _find_tariff(db: Session, origin: str, destination_region: str, vehicle_id: int) -> TariffRate:
    tariff = (
        db.query(TariffRate)
        .filter(
            TariffRate.origin == origin,
            TariffRate.destination_region == destination_region,
            TariffRate.vehicle_spec_id == vehicle_id,
        )
        .first()
    )
    if tariff:
        return tariff

    raise ValueError(f'No tariff configured for route {origin} to {destination_region} with selected vehicle ID {vehicle_id}')


def calculate_quote(db: Session, user: User, payload: QuoteInput) -> QuoteCalculationResult:
    vehicles = db.query(VehicleSpec).filter(VehicleSpec.active.is_(True)).all()
    if not vehicles:
        raise ValueError('Vehicle specification data not found')

    recommended_vehicle, oversize = _select_vehicle(payload, vehicles)
    tariff = _find_tariff(db, payload.origin, payload.destination_region, recommended_vehicle.id)

    ftl_usd = tariff.base_price_usd
    lcl_usd = tariff.lcl_price_usd_per_cbm * payload.total_cbm
    service_mode = 'LCL' if lcl_usd < ftl_usd else 'FTL'
    base_price = min(ftl_usd, lcl_usd)

    overweight_ton = max(0.0, payload.total_weight_kg - recommended_vehicle.max_weight_kg) / 1000
    overweight_surcharge = overweight_ton * tariff.overweight_surcharge_usd_per_ton
    size_surcharge = (base_price + overweight_surcharge) * (tariff.size_surcharge_pct / 100) if oversize else 0.0

    surcharge_usd = overweight_surcharge + size_surcharge
    before_discount = base_price + surcharge_usd

    discount_pct = TIER_DISCOUNTS.get(user.tier, 0.0)
    discount_usd = before_discount * (discount_pct / 100)
    final_usd = before_discount - discount_usd

    rate = db.query(ExchangeRate).filter(ExchangeRate.currency == 'USD').first()
    if not rate:
        raise ValueError('Exchange rate not found')

    final_krw = final_usd * float(rate.rate_to_krw)

    pricing_breakdown = {
        'base_ftl_usd': round(ftl_usd, 2),
        'base_lcl_usd': round(lcl_usd, 2),
        'selected_base_usd': round(base_price, 2),
        'overweight_ton': round(overweight_ton, 3),
        'overweight_surcharge_usd': round(overweight_surcharge, 2),
        'size_surcharge_usd': round(size_surcharge, 2),
        'discount_pct': discount_pct,
        'oversize': oversize,
        'exchange_rate': float(rate.rate_to_krw),
    }

    return QuoteCalculationResult(
        recommended_vehicle=recommended_vehicle,
        service_mode=service_mode,
        subtotal_usd=round(base_price, 2),
        surcharge_usd=round(surcharge_usd, 2),
        discount_usd=round(discount_usd, 2),
        final_usd=round(final_usd, 2),
        final_krw=round(final_krw, 0),
        pricing_breakdown=pricing_breakdown,
    )
