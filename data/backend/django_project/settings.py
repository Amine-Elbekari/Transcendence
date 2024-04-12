"""
Django settings for django_project project.

Generated by 'django-admin startproject' using Django 4.2.10.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-+&&yb^=f#p6jn%y5r!^@o5sg^-($f^%5@wzhv0fz(pi)b&w7v&'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]


# Application definition

INSTALLED_APPS = [
    #third party
    'daphne',
    #builtins
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    #third party
    'channels',
     'corsheaders',
    #apps
    'pong',
    'player',
    'api',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'api.middleware.JWTAuthenticationMiddleware'
    
]

OAUTHLIB_INSECURE_TRANSPORT=1
INTRA42_UID = 'u-s4t2ud-2a887db7be258249c9817d068ce6629e5c626777273fe3dd364da22527f093c9'
INTRA42_SECRET='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'
GOOGLE_CLIENT_ID='994035148776-lk5kj663oa6f1ha4ntdc3rq1jsvqjnov.apps.googleusercontent.com'
GOOGLE_CLIENT_SECRET='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'

ROOT_URLCONF = 'django_project.urls'


CORS_ORIGIN_ALLOW_ALL = True



CSRF_TRUSTED_ORIGINS = [
    'https://localhost',
    'https://10.11.11.5'
]
CSRF_TRUSTED_ORIGINS = [
        'https://localhost',
        'https://10.11.11.5',
        'https://10.11.13.8',
]
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True 

SESSION_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SAMESITE = 'None'
CSRF_COOKIE_SECURE = True
CORS_ALLOW_CREDENTIALS = True

#proxy stuff
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / "templates"],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'django_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    'default': {
        # 'ENGINE': 'django.db.backends.sqlite3',
        # 'NAME': BASE_DIR / 'db.sqlite3',
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'ping-pongdb',
        'USER': 'ael-beka',
        'PASSWORD': 'ael-beka1234',
        'HOST': 'postgres_db',
        'PORT': '5432',

    }
}


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = "player.CustomUser"

ASGI_APPLICATION = "django_project.asgi.application"
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],
        },
    },
}


#URL
#URL_FULL = "https://10.11.11.5/"
URL_FULL = "https://10.11.13.8/"