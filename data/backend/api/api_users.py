from rest_framework import viewsets
from player.models import CustomUser,Friendship
from .serializers import (AnotherUserSerializer,FriendshipInvitationSerializer)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

# ReadOnlyModelViewSet if you only want to provide read-only access
class UserViewSet(viewsets.ReadOnlyModelViewSet): 
    queryset = CustomUser.objects.all()[0:10]
    serializer_class = AnotherUserSerializer

class SendInvitationFriendView(APIView):
   def post(self, request, *args, **kwargs):
        # Get the sender from the JWT token
        sender = request.user

        # Get the recipient's username from the request data
        recipient_username = request.data.get('recipient_username')

        if not recipient_username:
            return Response({"error": "Recipient username is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the recipient exists
        try:
            recipient = CustomUser.objects.get(username=recipient_username)
        except CustomUser.DoesNotExist:
            return Response({"error": "Recipient user not found."}, status=status.HTTP_404_NOT_FOUND)

        # Check if the sender is not sending to themselves
        if sender == recipient:
            return Response({"error": "You cannot send a friend request to yourself."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the friendship already exists
        if Friendship.objects.filter(user1=sender, user2=recipient).exists():
            return Response({"error": "Friendship invitation already sent or exists."}, status=status.HTTP_400_BAD_REQUEST)

        # Create the Friendship record
        Friendship.objects.create(user1=sender, user2=recipient, status='pending')

        return Response({"message": "Friendship invitation sent successfully."}, status=status.HTTP_201_CREATED)
   


class AcceptFriendship(APIView):
    def post(self, request, *args, **kwargs):
        # Extract the friend's username from the request data
        friend_username = request.data.get('friend_username')

        if not friend_username:
            return Response({"error": "Friend's username is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the current user
        user = request.user

        # Check if the friendship request exists
        try:
            friendship = Friendship.objects.get(user1__username=friend_username, user2=user, status='pending')
        except Friendship.DoesNotExist:
            return Response({"error": "Friendship request not found."}, status=status.HTTP_404_NOT_FOUND)

        # Update the friendship status to 'accepted'
        friendship.status = 'accepted'
        friendship.save()

        return Response({"message": "Friendship accepted successfully."}, status=status.HTTP_200_OK)
    

class RefuseFriendship(APIView):
    def post(self, request, *args, **kwargs):
        # Extract the friend's username from the request data
        friend_username = request.data.get('friend_username')

        if not friend_username:
            return Response({"error": "Friend's username is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Get the current user
        user = request.user

        # Check if the friendship request exists
        try:
            friendship = Friendship.objects.get(user1__username=friend_username, user2=user, status='pending')
        except Friendship.DoesNotExist:
            return Response({"error": "Friendship request not found."}, status=status.HTTP_404_NOT_FOUND)

        # Delete the friendship request
        friendship.delete()

        return Response({"message": "Friendship request refused."}, status=status.HTTP_200_OK)
