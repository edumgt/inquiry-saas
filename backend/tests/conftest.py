import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Ensure test DB
os.environ['DATABASE_URL'] = 'sqlite:///:memory:'

from app.core.security import create_access_token
from app.db import Base, get_db
from app.main import app
from app.seed import seed_data

TEST_DATABASE_URL = 'sqlite:///:memory:'
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={'check_same_thread': False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture(scope='session', autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as session:
        seed_data(session)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture
def client(db):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token():
    return create_access_token(subject='admin@inquiry.local', extra={'role': 'admin'})

@pytest.fixture
def user_alpha_token():
    return create_access_token(subject='agent.alpha@globalfreight.com', extra={'role': 'user'})

@pytest.fixture
def user_beta_token():
    return create_access_token(subject='agent.beta@oceangate.com', extra={'role': 'user'})
