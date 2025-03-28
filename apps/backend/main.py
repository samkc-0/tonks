import requests
import secrets
import string
import time
import random
from typing import Literal
from fastapi import Body, FastAPI, HTTPException, Query, Request
from fastapi import Header, Depends
from fastapi import Request
from fastapi.responses import JSONResponse
from datetime import date, timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
from constants import first_names, last_names, fun_words

app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
BASE_URL = "https://www.1secmail.com/api/v1/"

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# ====================
# Utility Functions
# ====================


def generate_name():
    first = random.choice(first_names)
    last = random.choice(last_names)
    return first, last


def generate_password(length=12):
    characters = string.ascii_letters + string.digits + "_-."
    return "".join(secrets.choice(characters) for _ in range(length))


def generate_birthday(min_age=18, max_age=60):
    today = date.today()
    days_in_year = 365.25
    age_in_days = random.randint(
        min_age * int(days_in_year), max_age * int(days_in_year)
    )
    birthday = today - timedelta(days=age_in_days)
    return birthday.isoformat()  # e.g., "1991-08-23"


def get_profile_pic(
    username: str, purpose: Literal["LinkedIn", "Facebook", "Avatar", "other"] = "other"
) -> str:
    if purpose == "Avatar":
        return f"https://api.dicebear.com/7.x/fun-emoji/png?seed={username}&size=128"
    url = f"https://i.pravatar.cc/150?u={purpose}-{username}"
    return url


def generate_image_urls(username):
    return {
        "linkedin_photo_url": get_profile_pic(username, "LinkedIn"),
        "facebook_photo_url": get_profile_pic(username, "Facebook"),
        "avatar_url": get_profile_pic(username, "Avatar"),
    }


def generate_backstory(first_name, job_titles=None):
    jobs = job_titles or [
        "graphic designer",
        "developer",
        "barista",
        "freelancer",
        "teacher",
        "student",
        "marketing intern",
    ]
    passions = [
        "travel",
        "street food",
        "sci-fi",
        "bikepacking",
        "memes",
        "board games",
        "AI experiments",
        "photography",
    ]
    hometowns = [
        "Berlin",
        "Austin",
        "Wellington",
        "Madrid",
        "Toronto",
        "Lisbon",
        "Chicago",
        "Skopje",
    ]

    return (
        f"{first_name} is a {random.choice(jobs)} from {random.choice(hometowns)} "
        f"who loves {random.choice(passions)} and recently started experimenting with temp email identities."
    )


def generate_address():
    streets = [
        "Oak Street",
        "Maple Avenue",
        "Sunset Blvd",
        "Cedar Lane",
        "Broadway",
        "Main Street",
        "Hillcrest Drive",
        "Park Avenue",
        "River Road",
        "Highland Street",
    ]
    cities = [
        "Madrid",
        "Wellington",
        "Austin",
        "Berlin",
        "Toronto",
        "Lisbon",
        "Oslo",
        "Chicago",
    ]
    countries = [
        "Spain",
        "New Zealand",
        "USA",
        "Germany",
        "Canada",
        "Portugal",
        "Norway",
    ]

    street = random.choice(streets)
    street_number = random.randint(1, 299)
    city = random.choice(cities)
    zip_code = f"{random.randint(10000, 99999)}"
    country = random.choice(countries)

    return {
        "street": f"{street_number} {street}",
        "city": city,
        "zip_code": zip_code,
        "country": country,
    }


def generate_nickname(first_name):
    base = first_name.lower()
    style = random.choice(
        [
            f"{base}_{random.choice(fun_words)}",
            f"{random.choice(fun_words)}{random.randint(10,99)}",
            f"{random.choice(fun_words)}_{base}",
            f"{base}{random.randint(100,999)}",
        ]
    )
    return style


def generate_person():
    first_name, last_name = generate_name()
    birthday = generate_birthday()
    username = f"{first_name.lower()}.{last_name.lower()}{random.randint(10, 99)}"
    nickname = generate_nickname(first_name)
    backstory = generate_backstory(first_name)
    image_urls = generate_image_urls(username)
    address = generate_address()

    return {
        "email": f"{username}@example.com",  # Generated email without account creation
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "birthday": birthday,
        "nickname": nickname,
        "backstory": backstory,
        **image_urls,
        "password": generate_password(),  # Generate password without account creation
        "address": address,
    }


def get_messages(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/messages", headers=headers)
    resp.raise_for_status()
    return resp.json()["hydra:member"]


def read_message(token, message_id):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"{BASE_URL}/messages/{message_id}", headers=headers)
    resp.raise_for_status()
    return resp.json()


# ====================
# API Routes
# ====================


def verify_api_key(x_api_key: str = Header(default=None)):
    # if os.getenv("ENV") == "production" and x_api_key != API_KEY:
    # raise HTTPException(status_code=403, detail="Invalid API key")
    pass


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


def create_email(username: str):
    domain_resp = requests.get("https://api.mail.tm/domains")
    domain_resp.raise_for_status()
    domain = domain_resp.json()["hydra:member"][0]["domain"]

    email = f"{username}@{domain}"
    password = generate_password()

    payload = {"address": email, "password": password}

    print(f"Creating: {email} / {password}")
    resp = requests.post("https://api.mail.tm/accounts", json=payload)
    print("Create response:", resp.status_code, resp.text)

    if resp.status_code == 409:
        raise HTTPException(status_code=409, detail="Username already exists.")
    resp.raise_for_status()
    data = resp.json()
    email = data["address"]
    return email, password


def get_token(email, password):
    print(f"Getting token for: {email}")
    paylod = {"address": email, "password": password}
    headers = {"Content-Type": "application/json"}
    resp = requests.post("https://api.mail.tm/token", json=paylod, headers=headers)
    print("Token response:", resp.status_code, resp.text)
    resp.raise_for_status()
    return resp.json()["token"]


@app.post("/upgrade-email")
@limiter.limit("5/minute")
async def upgrade_email(
    request: Request, person: dict = Body(...), _: str = Depends(verify_api_key)
):
    username = person.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Missing username.")

    try:
        email, password = create_email(username)
        token = get_token(email, password)
    except requests.HTTPError as e:
        print("Mail.tm upgrade failed:", e)
        raise HTTPException(status_code=500, detail="Email upgrade failed.")

    return {
        "email": email,
        "password": password,
        "token": token,
        "real_email_success": True,
    }


@app.post("/create")
@limiter.limit("50/minute")
def create_temp_account(request: Request, _: str = Depends(verify_api_key)):
    person = generate_person()
    return {
        "email": person["email"],
        "username": person["username"],
        "token": None,
        "first_name": person["first_name"],
        "last_name": person["last_name"],
        "birthday": person["birthday"],
        "nickname": person["nickname"],
        "backstory": person["backstory"],
        "address": person["address"],
        "linkedin_photo_url": person["linkedin_photo_url"],
        "facebook_photo_url": person["facebook_photo_url"],
        "avatar_url": person["avatar_url"],
        "password": person["password"],
    }


def get_messages(token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get("https://api.mail.tm/messages", headers=headers)
    resp.raise_for_status()
    return resp.json()["hydra:member"]


@app.get("/inbox")
@limiter.limit("10/minute")
def get_inbox(request: Request, token: str = Query(...)):
    return get_messages(token)


def read_message(token, message_id):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.get(f"https://api.mail.tm/messages/{message_id}", headers=headers)
    resp.raise_for_status()
    return resp.json()


@app.get("/message")
@limiter.limit("10/minute")
def get_message(request: Request, token: str = Query(...), id: str = Query(...)):
    return read_message(token, id)
