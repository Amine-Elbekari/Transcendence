from functools import wraps
from django.http import JsonResponse
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from player.models import Token  # Adjust the import according to your project structure

def jwt_cookie_required_api(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        jwt_auth = JWTAuthentication()
        jwt_token = request.COOKIES.get('jwt')

        if jwt_token is None:
            # Return a 401 Unauthorized response for API
            return JsonResponse({'detail': 'Authorization cookie missing'}, status=401)

        try:
            if not Token.objects.filter(token=jwt_token).exists():
                # Token does not exist, return 401 Unauthorized
                return JsonResponse({'detail': 'Invalid token'}, status=401)

            validated_token = jwt_auth.get_validated_token(jwt_token)
            request.user = jwt_auth.get_user(validated_token)
        except TokenError as e:
            # Return a 401 Unauthorized response with error detail
            return JsonResponse({'detail': str(e)}, status=401)

        return view_func(request, *args, **kwargs)

    return _wrapped_view
