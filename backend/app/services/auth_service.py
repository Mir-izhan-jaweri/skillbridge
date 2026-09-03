from flask_jwt_extended import create_access_token, create_refresh_token


def issue_tokens(user) -> dict:
    identity = str(user.id)
    return {
        "access_token": create_access_token(
            identity=identity, additional_claims={"role": user.role}
        ),
        "refresh_token": create_refresh_token(identity=identity),
    }
