from app.utils import generate_unique_quote_no


def test_generate_unique_quote_no(db):
    no1 = generate_unique_quote_no(db)
    assert no1.startswith("Q-")
    assert no1.endswith("00001") or int(no1.split("-")[-1]) >= 1


def test_quote_calculate_endpoint(client, user_alpha_token):
    payload = {
        "origin": "Busan Port",
        "destination_region": "Seoul Metro",
        "destination_address": "101 Teheran-ro, Seoul",
        "package_count": 10,
        "total_weight_kg": 1200.0,
        "total_cbm": 5.0,
        "cargo_length_cm": 250.0,
        "cargo_width_cm": 150.0,
        "cargo_height_cm": 150.0,
    }
    response = client.post(
        "/api/quotes/calculate",
        json=payload,
        headers={"Authorization": f"Bearer {user_alpha_token}"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["quote_no"].startswith("Q-")
    assert data["total_weight_kg"] == 1200.0
    assert data["total_cbm"] == 5.0
    assert data["user_id"] > 0


def test_list_quotes_permissions(client, admin_token, user_alpha_token, user_beta_token):
    res_alpha = client.get("/api/quotes", headers={"Authorization": f"Bearer {user_alpha_token}"})
    assert res_alpha.status_code == 200
    alpha_quotes = res_alpha.json()

    res_admin = client.get("/api/quotes?include_all=true", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin.status_code == 200
    admin_quotes = res_admin.json()
    assert len(admin_quotes) >= len(alpha_quotes)
