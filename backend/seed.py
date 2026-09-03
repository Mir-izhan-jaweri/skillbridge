"""Populate the database with skills, opportunities, courses, and demo users.

Usage: python seed.py
"""

from app import create_app
from app.extensions import db
from app.services import seed_service

app = create_app()

with app.app_context():
    db.create_all()
    seed_service.run()
    print("Seed complete. Admin: admin@skillbridge.dev / Admin@123 | Demo: demo@skillbridge.dev / Demo@123")
