import pytest
from app.models import User
from app.services.quote_calculator import QuoteInput, calculate_quote, parse_cargo_text


def test_parse_cargo_text_korean():
    raw = "\ubd80\uc0b0\ud56d\uc5d0\uc11c \uc11c\uc698\ub85c 12\ubc15\uc2a4 1500kg 4.5cbm 300*180*160cm\n\uc8fc\uc18c: \uc11c\uc698\uc2dc \uac15\ub0a8\uad6c \ud14c\ud5e4\ub780\ub85c 152"
    parsed = parse_cargo_text(raw)
    assert parsed["origin"] == "Busan Port"
    assert parsed["destination_region"] == "Seoul Metro"
    assert parsed["package_count"] == 12
    assert parsed["total_weight_kg"] == 1500.0
    assert parsed["total_cbm"] == 4.5
    assert parsed["cargo_length_cm"] == 300.0
    assert parsed["cargo_width_cm"] == 180.0
    assert parsed["cargo_height_cm"] == 160.0
    assert "\ud14c\ud5e4\ub780\ub85c" in parsed["destination_address"]
    assert "Legal Disclaimer" in parsed["legal_disclaimer"]


def test_parse_cargo_text_tons_and_english():
    raw = "Incheon to Daejeon, 5 pkgs, 2.5tons, 6cbm, size 200x150x150cm\nAddress: 45 Daedeok-daero, Daejeon"
    parsed = parse_cargo_text(raw)
    assert parsed["origin"] == "Incheon Port"
    assert parsed["destination_region"] == "Daejeon"
    assert parsed["package_count"] == 5
    assert parsed["total_weight_kg"] == 2500.0
    assert parsed["total_cbm"] == 6.0


def test_calculate_quote_vip_discount(db):
    vip_user = db.query(User).filter(User.tier == "VIP").first()
    inp = QuoteInput(
        origin="Busan Port",
        destination_region="Seoul Metro",
        total_weight_kg=800.0,
        total_cbm=2.0,
        cargo_length_cm=200.0,
        cargo_width_cm=140.0,
        cargo_height_cm=140.0,
    )
    result = calculate_quote(db, vip_user, inp)
    assert result.service_mode in ["LCL", "FTL"]
    assert result.pricing_breakdown["discount_pct"] == 10.0
    assert result.final_usd < result.subtotal_usd
    assert result.final_krw > 0


def test_calculate_quote_invalid_tariff(db):
    user = db.query(User).first()
    inp = QuoteInput(
        origin="NonExistent Port",
        destination_region="NonExistent Region",
        total_weight_kg=500.0,
        total_cbm=1.0,
        cargo_length_cm=100.0,
        cargo_width_cm=100.0,
        cargo_height_cm=100.0,
    )
    with pytest.raises(ValueError, match="No tariff configured"):
        calculate_quote(db, user, inp)
