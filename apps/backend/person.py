from datetime import date, timedelta
import random
import secrets
import string
from typing import Literal
from constants import first_names, last_names, fun_words


def generate_name():
    first = random.choice(first_names)
    last = random.choice(last_names)
    return first, last


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
