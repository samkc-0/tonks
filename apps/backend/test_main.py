import pytest
from fastapi.testclient import TestClient
from main import app, get_token, get_messages, read_message

client = TestClient(app)


def test_create_temp_account():
    # Test basic response structure
    response = client.post("/create", headers={"X-API-Key": "test"})
    assert response.status_code == 200
    data = response.json()

    # Validate required fields
    required_fields = {
        "email": str,
        "username": str,
        "first_name": str,
        "last_name": str,
        "birthday": str,
        "nickname": str,
        "backstory": str,
        "address": dict,
        "linkedin_photo_url": str,
        "facebook_photo_url": str,
        "avatar_url": str,
        "password": str,
    }

    for field, field_type in required_fields.items():
        assert field in data
        assert isinstance(data[field], field_type)

    # Validate email format
    assert "@example.com" in data["email"]

    # Validate address sub-fields
    address_fields = ["street", "city", "zip_code", "country"]
    for field in address_fields:
        assert field in data["address"]
        assert isinstance(data["address"][field], str)


def test_api_key_security():
    # Test with missing API key (currently disabled in code)
    response = client.post("/create")
    assert response.status_code == 200  # Change to 403 when security is enabled


def test_fetch_messages():
    # Create temp account to get credentials
    create_response = client.post("/create", headers={"X-API-Key": "test"})
    data = create_response.json()

    # Get token with created credentials
    token = get_token(data["email"], data["password"])

    # Test messages endpoint
    response = client.get("/messages", params={"token": token})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_fetch_single_message():
    # Create temp account and get messages
    create_response = client.post("/create", headers={"X-API-Key": "test"})
    data = create_response.json()
    token = get_token(data["email"], data["password"])
    messages = get_messages(token)

    if messages:
        # Test with existing message ID
        message_id = messages[0]["id"]
        response = client.get(f"/message/{message_id}", params={"token": token})
        assert response.status_code == 200
        assert "@context" in response.json()
    else:
        # Handle case with no messages
        pytest.skip("No messages available for testing")


def test_rate_limiting():
    # Test rate limit enforcement
    for _ in range(10):
        response = client.post("/create", headers={"X-API-Key": "test"})
        assert response.status_code == 200

    # 11th request should be rate limited
    response = client.post("/create", headers={"X-API-Key": "test"})
    assert response.status_code == 429
