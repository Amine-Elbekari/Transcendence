"""
ASGI config for django_project project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""
import os
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import path,re_path
from pong import consumers

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')
# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

websocket_urlpatterns = [
    # path('ws/user_status/', consumers.UserOnlineStatusConsumer.as_asgi()),
    path('ws/game/', consumers.NotificationConsumer.as_asgi()),
    path('ws/tournament/<str:tournament_name>/', consumers.TournamentConsumer.as_asgi()),
    re_path(r'ws/pong/', consumers.GameConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})

