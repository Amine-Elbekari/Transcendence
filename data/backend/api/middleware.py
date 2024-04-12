from django.contrib.auth.middleware import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication
from player.models import CustomUser, Token  # Make sure to import CustomUser and Token

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        jwt_auth = JWTAuthentication()

        # Get the JWT token from the 'jwt' cookie
        token_str = request.COOKIES.get('jwt')
        if token_str:
            # Validate the token and set the user
            try:
                validated_token = jwt_auth.get_validated_token(token_str)
                user_id = validated_token['user_id']
                user = CustomUser.objects.get(id=user_id)  # Use CustomUser instead of User

                # Optionally, check if the token exists in your Token model
                if not Token.objects.filter(user=user, token=token_str).exists():
                    raise Exception("Token does not exist")

                # Set the user in the request
                request.user = user
            except Exception as e:
                # Handle token validation errors (e.g., token expired, user not found, etc.)
                pass
