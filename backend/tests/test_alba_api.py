from app.models import AlbaApplication, AlbaJob, User
from app.utils import generate_unique_job_no


def test_generate_unique_job_no(db):
    no = generate_unique_job_no(db)
    assert no.startswith("ALB-")


def test_create_and_get_alba_job(client, admin_token):
    payload = {
        "title": "Test Warehouse Packing",
        "location": "Seoul Gangnam",
        "job_date": "2026-12-01",
        "start_time": "09:00",
        "end_time": "18:00",
        "headcount": 3,
        "wage_per_hour": 12000,
        "job_type": "??/??",
        "description": "Test job description",
    }
    res = client.post("/api/alba/jobs", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 201, res.text
    job_data = res.json()
    assert job_data["job_no"].startswith("ALB-")
    assert job_data["title"] == "Test Warehouse Packing"


def test_alba_applications_authorization(client, db, admin_token, user_alpha_token, user_beta_token):
    alpha_user = db.query(User).filter(User.email == "agent.alpha@globalfreight.com").first()

    job = AlbaJob(
        job_no="ALB-TEST-0001",
        title="Alpha Exclusive Job",
        location="Incheon",
        job_date="2026-12-01",
        start_time="09:00",
        end_time="17:00",
        headcount=2,
        wage_per_hour=11000,
        job_type="?????",
        created_by=alpha_user.id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    app_payload = {
        "worker_name": "???",
        "worker_contact": "010-9999-8888",
        "note": "Available",
    }
    app_res = client.post(
        f"/api/alba/jobs/{job.id}/applications",
        json=app_payload,
        headers={"Authorization": f"Bearer {user_beta_token}"},
    )
    assert app_res.status_code == 201
    app_id = app_res.json()["id"]

    res_owner = client.get(
        f"/api/alba/jobs/{job.id}/applications",
        headers={"Authorization": f"Bearer {user_alpha_token}"},
    )
    assert res_owner.status_code == 200
    assert len(res_owner.json()) >= 1

    res_admin = client.get(
        f"/api/alba/jobs/{job.id}/applications",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_admin.status_code == 200

    res_forbidden = client.get(
        f"/api/alba/jobs/{job.id}/applications",
        headers={"Authorization": f"Bearer {user_beta_token}"},
    )
    assert res_forbidden.status_code == 403

    patch_forbidden = client.patch(
        f"/api/alba/applications/{app_id}",
        json={"status": "accepted", "worked_hours": 8.0},
        headers={"Authorization": f"Bearer {user_beta_token}"},
    )
    assert patch_forbidden.status_code == 403

    patch_ok = client.patch(
        f"/api/alba/applications/{app_id}",
        json={"status": "accepted", "worked_hours": 8.0},
        headers={"Authorization": f"Bearer {user_alpha_token}"},
    )
    assert patch_ok.status_code == 200
    assert patch_ok.json()["status"] == "accepted"
    assert patch_ok.json()["worked_hours"] == 8.0


def test_alba_dashboard_summary(client, admin_token):
    res = client.get("/api/alba/dashboard", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total_jobs" in data
    assert "total_settlement_krw" in data
    assert data["total_settlement_krw"] >= 0
