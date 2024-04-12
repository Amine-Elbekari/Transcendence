from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.urls import path,re_path
from pong import consumers

websocket_urlpatterns = [
    # path('ws/user_status/', consumers.UserOnlineStatusConsumer.as_asgi()),
    #path('ws/user_status/', consumers.NotificationConsumer.as_asgi()),
    path('ws/game/', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/pong/', consumers.GameConsumer.as_asgi()),
]

application = ProtocolTypeRouter({
    # ...
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    ),
})