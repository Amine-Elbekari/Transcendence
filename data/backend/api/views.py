from django.http import JsonResponse
from django.conf import settings
from requests.auth import HTTPBasicAuth
from requests_oauthlib import OAuth2Session
from django.shortcuts import redirect
from player.models import CustomUser,Token
from django.contrib.auth import login
from django.contrib.auth.views import LogoutView
from django.contrib.auth import logout
from django.shortcuts import render, get_object_or_404
from django.core.files.storage import FileSystemStorage
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from rest_framework_simplejwt.tokens import RefreshToken
from django.http import HttpResponse
import pyotp
import qrcode
from PIL import Image
import base64
import io
import json
from .decorators import jwt_cookie_required_api
from rest_framework.views import APIView
from pong.models import Tournament
from django.conf import settings


#websocket stuff
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.csrf import ensure_csrf_cookie

#websocket stuff
def user_goes_online(user):
    # Logic to determine that user goes online
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        "1234",
        {
            "type": "send_user_online_status",
            "username": user.username,
            "is_online": True,
        }
    )


# Create your views here.
def oauth2_login(request):
    UID = settings.INTRA42_UID
    SECRET = settings.INTRA42_SECRET
    AUTHORIZE_URL = "https://api.intra.42.fr/oauth/authorize"
    TOKEN_URL = "https://api.intra.42.fr/oauth/token"

    # Create an OAuth2 session
    client = OAuth2Session(client_id=UID, redirect_uri=request.build_absolute_uri('/api/oauth/callback'))
    print("DEBUG " + request.build_absolute_uri('/oauth/callback'))
    # Get the authorization URL
    authorization_url, state = client.authorization_url(AUTHORIZE_URL)

    # Save the state in the session for validation later
    request.session['oauth_state'] = state

    return redirect(authorization_url)

def oauth2_google_login(request):
    GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
    AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/auth"
    SCOPE = ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile']

    client = OAuth2Session(client_id=GOOGLE_CLIENT_ID, scope=SCOPE, redirect_uri=request.build_absolute_uri('/api/oauth/google_callback/'))
    authorization_url, state = client.authorization_url(AUTHORIZE_URL, access_type="offline", prompt="select_account")

    request.session['oauth_state'] = state
    return redirect(authorization_url)


def oauth2_callback(request):
    UID = settings.INTRA42_UID
    SECRET = settings.INTRA42_SECRET
    TOKEN_URL = "https://api.intra.42.fr/oauth/token"

    # Validate the state to prevent CSRF attacks
    if 'oauth_state' not in request.session or request.GET.get('state') != request.session['oauth_state']:
        return JsonResponse({'error_message': 'Invalid state'}, status=400)

    try:
         # Fetch the access token
        client = OAuth2Session(client_id=UID, redirect_uri=request.build_absolute_uri('/api/oauth/callback'))
        print("DEBUG " + request.build_absolute_uri('/oauth/callback'))
        token = client.fetch_token(
            TOKEN_URL,
            authorization_response=request.build_absolute_uri(),
            auth=HTTPBasicAuth(UID, SECRET),
        )

        # Make a request to the API
        response = client.get("https://api.intra.42.fr/v2/me")
        cp_username = ""
        # Process the API response and return the user data as JSON
        if response.status_code == 200:
            user_data = response.json()

            picture = user_data.get('image')
            avatar = picture["versions"]["small"]
            username = user_data.get('login')
            cp_username = username
            email = user_data.get('email')
            first_name = user_data.get('first_name')
            last_name = user_data.get('last_name')
            url = settings.URL_FULL + 'home'
            try:
                user = CustomUser.objects.get(username=username)
                user.is_online = True
                if user.two_factor_secret and user.qr_is_scanned == True:
                        url = settings.URL_FULL + 'login'
                user.save()
            except CustomUser.DoesNotExist:
                user = CustomUser.objects.create_user(username, email=email,avatar_url=avatar,first_name=first_name,last_name=last_name)
                # user.generate_two_factor_secret()
                user.is_online = True 
                user.save()


            request.session['oauth_authenticated'] = True

            login(request, user)

            if user.two_factor_secret is None or user.two_factor_secret is '' or user.qr_is_scanned == False:
                refresh = RefreshToken.for_user(user)
                jwt_token = str(refresh.access_token)
                existing_token = Token.objects.filter(user=user).first()
                if existing_token:
                    existing_token.token = jwt_token
                    existing_token.save()
                else:
                    token = Token.objects.create(user=user, token=jwt_token)
            #user_goes_online(user)
            
                response = redirect(url)
                response.set_cookie('jwt', jwt_token, httponly=True)
            else:
                response = redirect(url)
                if user.qr_is_scanned == True:
                     response.set_cookie('requires_2fa', 'true', httponly=True)
                #response.set_cookie('requires_2fa', 'true', httponly=True)
            return response
            #return JsonResponse({'user_data': 'killer'})
        else:
            return JsonResponse({'error_message': 'Failed to fetch user data'}, status=response.status_code)
    except Exception as e:
        return JsonResponse({'error_message': str(e)}, status=400)
    

def oauth2_google_callback(request):
    GOOGLE_CLIENT_ID = settings.GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET = settings.GOOGLE_CLIENT_SECRET
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

    # Validate the state to prevent CSRF attacks
    if 'oauth_state' not in request.session or request.GET.get('state') != request.session['oauth_state']:
        return JsonResponse({'error_message': 'Invalid state'}, status=400)

    try:
         # Fetch the access token
        client = OAuth2Session(client_id=GOOGLE_CLIENT_ID, redirect_uri=request.build_absolute_uri('/api/oauth/google_callback/'))
        token = client.fetch_token(
        TOKEN_URL,authorization_response=request.build_absolute_uri(),
        client_secret=GOOGLE_CLIENT_SECRET
        )

     
    

        # Make a request to the API
        response = client.get(USERINFO_URL)
        cp_username = ""
        # Process the API response and return the user data as JSON
        if response.status_code == 200:
            user_data = response.json()

            # picture = user_data.get('image')
            # avatar = picture["versions"]["small"]
            # username = user_data.get('login')
            # cp_username = username
            # email = user_data.get('email')
            # first_name = user_data.get('first_name')
            # last_name = user_data.get('last_name')

            picture = user_data.get('picture')  # URL of the user's profile picture
            email = user_data.get('email')  # User's email address
            first_name = user_data.get('given_name')  # User's given (first) name
            last_name = user_data.get('family_name')  # User's family (last) name
            username = first_name + "." + last_name
            username = username.lower()
            url = settings.URL_FULL + '/home'
            try:
                user = CustomUser.objects.get(username=username)
                user.is_online = True
                if user.two_factor_secret and user.qr_is_scanned == True:
                        url = settings.URL_FULL + '/login'
                user.save()
            except CustomUser.DoesNotExist:
                user = CustomUser.objects.create_user(username, email=email,avatar_url=picture,first_name=first_name,last_name=last_name)
                # user.generate_two_factor_secret()
                user.is_online = True 
                user.save()


            request.session['oauth_authenticated'] = True

            login(request, user)

            if user.two_factor_secret is None or user.two_factor_secret is '' or user.qr_is_scanned == False:
                refresh = RefreshToken.for_user(user)
                jwt_token = str(refresh.access_token)
                existing_token = Token.objects.filter(user=user).first()
                if existing_token:
                    existing_token.token = jwt_token
                    existing_token.save()
                else:
                    token = Token.objects.create(user=user, token=jwt_token)
            #user_goes_online(user)
            
                response = redirect(url)
                response.set_cookie('jwt', jwt_token, httponly=True)
            else:
                response = redirect(url)
                if user.qr_is_scanned == True:
                     response.set_cookie('requires_2fa', 'true', httponly=True)
                #response.set_cookie('requires_2fa', 'true', httponly=True)
            return response
            #return JsonResponse({'user_data': 'killer'})
        else:
            return JsonResponse({'error_message': 'Failed to fetch user data'}, status=response.status_code)
    except Exception as e:
        return JsonResponse({'error_message': str(e)}, status=400)
    

@ensure_csrf_cookie
def set_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})

#@csrf_exempt
# @require_http_methods(["POST"])
def check_token_exists(request):
    try:
        jwt_token = request.COOKIES.get('jwt', '')
        token_obj = Token.objects.filter(token=jwt_token).first()

        if token_obj:
            return JsonResponse({
                'token_exists': True,
                'username': token_obj.user.username  # Return the associated username
            })
        else:
            return JsonResponse({'token_exists': False})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        # Log the error for debugging purposes
        return JsonResponse({'error': 'An error occurred'}, status=500)
    


class CustomLogoutView(APIView):

    def logout_user(self, request):
        response_data = {'success': False}

        try:
            # Delete the token associated with the user
            Token.objects.filter(token=request.COOKIES.get('jwt')).delete()

            # Set is_online to False if user is authenticated
            # if request.user.is_authenticated:
            #     request.user.is_online = False
            #     request.user.save()

            response_data['success'] = True
        except Exception as e:
            # Log the exception or handle it as needed
            print(e)
        logout(request)
        response = JsonResponse(response_data)
        response.delete_cookie('jwt') # Delete the JWT cookie
        if(request.COOKIES.get('requires_2fa')):
            response.delete_cookie('requires_2fa')  
        return response

    def get(self, request, *args, **kwargs):
        return self.logout_user(request)

    def post(self, request, *args, **kwargs):
        return self.logout_user(request)
    
# @jwt_cookie_required_api
def get_profile(request,username):
    profile = CustomUser.objects.get(username=username)
    tournament_wins = Tournament.objects.filter(winner=profile).count()
    if profile.two_factor_secret:
        # Generate QR code only if 2FA is enabled
        totp_uri = pyotp.TOTP(profile.two_factor_secret).provisioning_uri(
            profile.email, issuer_name="YourIssuerName"
        )
        qr = qrcode.make(totp_uri)
        buf = io.BytesIO()
        qr.save(buf, format='PNG')
        image_stream = buf.getvalue()
        buf.close()
        qr_code_data = base64.b64encode(image_stream).decode()
    else:
        qr_code_data = None
    return JsonResponse({
        'username': profile.username,
        'is_online': profile.is_online,
        'wins': profile.wins,
        'loses': profile.loses,
        'avatar_url': profile.avatar_url, #if profile.is_change_pic else profile.upload_pic.url
        'first_name' : profile.first_name,
        'last_name' : profile.last_name,
        'qr_code_data': qr_code_data, 
        # Add other fields as necessary
    })

# me
def getUserLoggedInData(request):
    user = request.user
    tournament_wins = Tournament.objects.filter(winner=user).count()
    if user.two_factor_secret and user.qr_is_scanned == True:
        # Generate QR code only if 2FA is enabled
        totp_uri = pyotp.TOTP(user.two_factor_secret).provisioning_uri(
            user.email, issuer_name="YourIssuerName"
        )
        qr = qrcode.make(totp_uri)
        buf = io.BytesIO()
        qr.save(buf, format='PNG')
        image_stream = buf.getvalue()
        buf.close()
        qr_code_data = base64.b64encode(image_stream).decode()
    else:
        qr_code_data = None
    return JsonResponse({
        'username': user.username,
        'is_online': user.is_online,
        'wins': user.wins,
        'loses': user.loses,
        'avatar_url': user.avatar_url, #if profile.is_change_pic else profile.upload_pic.url
        'first_name' : user.first_name,
        'last_name' : user.last_name,
        'qr_code_data': qr_code_data, 
        # Add other fields as necessary
    })


#add decorator to protect it 
def enable_2fa(request):
    user = request.user
    if not user.two_factor_secret or user.two_factor_secret == '':
        user.generate_two_factor_secret()

    totp_uri = pyotp.totp.TOTP(user.two_factor_secret).provisioning_uri(
        user.email, issuer_name="PingPong"
    )

    qr = qrcode.make(totp_uri)
    buf = io.BytesIO()
    qr.save(buf)
    user.save()
    image_stream = buf.getvalue()
    response = HttpResponse(image_stream, content_type="image/png")
    return response

def disable_2fa(request):
    user = request.user
    user.two_factor_secret = ''  # Clear the 2FA secret
    user.qr_is_scanned = False
    user.save()
    return JsonResponse({'success': True, 'message': '2FA disabled successfully'})

def check_2fa_required(request):
    if request.user.is_authenticated:
    # Accessing the HttpOnly cookie; it's automatically included in the request
        require_2fa = request.COOKIES.get('requires_2fa', 'false')
        user = request.user
        is_2fa_required = require_2fa.lower() == 'true' and user.qr_is_scanned == True
        return JsonResponse({'require_2fa': 'true','avatar_url':user.avatar_url})
    return JsonResponse({'require_2fa': 'false'})

def verify_2fa(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        user = request.user
        totp = pyotp.TOTP(user.two_factor_secret)
        
        if totp.verify(token):
            # login(request, user)  # Log the user in
            refresh = RefreshToken.for_user(user)
            jwt_token = str(refresh.access_token)
            existing_token = Token.objects.filter(user=user).first()
            if existing_token:
                existing_token.token = jwt_token
                existing_token.save()
            else:
                token = Token.objects.create(user=user, token=jwt_token)
            response = HttpResponse("true")
            response.set_cookie('jwt', jwt_token, httponly=True)
            return response
        else:
            return HttpResponse("false")
        

def verify_2fa_firsttime(request):
    if request.method == 'POST':
        token = request.POST.get('token')
        user = request.user
        totp = pyotp.TOTP(user.two_factor_secret)
        
        if totp.verify(token):
            # login(request, user)  # Log the user in
            user.qr_is_scanned = True
            user.save()
            response = HttpResponse("true")
            return response
        else:
            return HttpResponse("false")
        

def logoutTwoFactor(request):
    logout(request)

    # Create a response object
    response = JsonResponse({'success': True, 'message': 'Logged out successfully'})

    # Delete the requires_2fa cookie by setting its expiry to the past
    response.delete_cookie('requires_2fa')

    return response
    