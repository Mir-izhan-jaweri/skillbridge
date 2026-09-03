from . import (
    admin_routes,
    auth_routes,
    chat_routes,
    course_routes,
    insight_routes,
    opportunity_routes,
    profile_routes,
    skill_routes,
)

ALL_BLUEPRINTS = [
    auth_routes.bp,
    profile_routes.bp,
    skill_routes.bp,
    opportunity_routes.bp,
    course_routes.bp,
    insight_routes.bp,
    chat_routes.bp,
    admin_routes.bp,
]
