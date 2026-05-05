from urllib.parse import parse_qs
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import User

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_params = parse_qs(scope["query_string"].decode())
        token = query_params.get("token", [None])[0]
        
        if token:
            try:
                from django.conf import settings
                from rest_framework_simplejwt.authentication import JWTAuthentication
                
                # Use standard JWT authentication logic
                jwt_auth = JWTAuthentication()
                validated_token = jwt_auth.get_validated_token(token)
                scope["user"] = await get_user(validated_token["user_id"])
            except Exception as e:
                print(f"WebSocket Auth Error: {e}")
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await self.app(scope, receive, send)
