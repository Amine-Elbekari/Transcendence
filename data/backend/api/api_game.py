#django stuff
from django.shortcuts import get_object_or_404

#websocket stuff
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

#decorators for post http
from django.views.decorators.http import require_POST

#json
import json
from django.http import JsonResponse

#models
from pong.models import GameInvitation
from player.models import CustomUser

#websocket stuff
def user_goes_online(user):
    # Logic to determine that user goes online
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"game_{user.id}",
        {
            "type": "send_user_online_status",
            "username": user.username,
            "is_online": True,
        }
    )

@require_POST
def invite_request(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        profile = CustomUser.objects.get(username=username)
        print("username " + username + " profile " + request.user.username)
        if request.user.username != username:
            user_goes_online(profile)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    return JsonResponse({
        'username': profile.username,
        'is_online': profile.is_online,
        'wins': profile.wins,
        'loses': profile.loses,
        'avatar_url': profile.avatar_url, #if profile.is_change_pic else profile.upload_pic.url
        'first_name' : profile.first_name,
        'last_name' : profile.last_name,  
        # Add other fields as necessary
    })

@require_POST
def send_invitation(request, receiver_username):
    # Logic to create an invitation
    receiver = get_object_or_404(CustomUser, username=receiver_username)
    invitation = GameInvitation.objects.create(
        sender=request.user,
        receiver=receiver,
        room_name=f"game_{request.user.id}_{receiver.id}",  # Example room name generation
        status='pending'
    )
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{receiver.id}",
        {
            "type": "send_notification",
            "message": {
                "action": "invitation_sent",
                "details": {
                    "sender": request.user.username,
                    "room_name":f"game_{request.user.id}_{receiver.id}",
                    "invitation_id": invitation.id
                }
            }
        }
    )

    return JsonResponse({'status': 'success', 'invitation_id': invitation.id})
    

@require_POST
def accept_invitation(request, invitation_id):
    invitation = get_object_or_404(GameInvitation, id=invitation_id, receiver=request.user)
    invitation.status = 'accepted'
    invitation.save()
    # Notify the sender about the acceptance via WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{invitation.sender.id}",
        {
            "type": "send_notification",
            "message": {
                "action": "invitation_accepted",
                "details": {
                    "receiver": request.user.username
                }
            }
        }
    )
    return JsonResponse({'status': 'accepted'})

@require_POST
def refuse_invitation(request, invitation_id):
    # Logic to refuse an invitation
    invitation = get_object_or_404(GameInvitation, id=invitation_id, receiver=request.user)
    invitation.status = 'refused'
    invitation.save()
    # Notify the sender about the refusal via WebSocket
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"notifications_{invitation.sender.id}",
        {
            "type": "send_notification",
            "message": {
                "action": "invitation_refused",
                "details": {
                    "receiver": request.user.username
                }
            }
        }
    )
    return JsonResponse({'status': 'refused'})
    