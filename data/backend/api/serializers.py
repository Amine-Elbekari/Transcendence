# serializers.py

from rest_framework import serializers
from pong.models import (
            Tournament,
            TournamentParticipant,
            Match,
            MatchResult
              )
from player.models import (CustomUser,Friendship)
from rest_framework.exceptions import ValidationError
from rest_framework.fields import SerializerMethodField
from django.core.exceptions import ObjectDoesNotExist



class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        #fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_url']
        fields = ['username']

class AnotherUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username',  'avatar_url']


class FriendshipInvitationSerializer(serializers.ModelSerializer):
    recipient_username = serializers.CharField(write_only=True)

    class Meta:
        model = Friendship
        fields = ['recipient_username']

    def create(self, validated_data):
        recipient_username = validated_data['recipient_username']

        try:
            recipient = CustomUser.objects.get(username=recipient_username)
        except ObjectDoesNotExist:
            raise serializers.ValidationError({"recipient_username": "User with this username does not exist."})

        sender = self.context['request'].user

        if sender.username == recipient_username:
            raise serializers.ValidationError({"recipient_username": "You cannot send a friend request to yourself."})

        friendship, created = Friendship.objects.get_or_create(
            user1=sender,
            user2=recipient,
            defaults={'status': 'pending'}
        )
        if not created:
            raise serializers.ValidationError("Friendship invitation already sent or exists.")

        return friendship


class TournamentSerializer(serializers.ModelSerializer):
    creator_username = serializers.SerializerMethodField()
    participant_count = serializers.SerializerMethodField()
    class Meta:
        model = Tournament
        fields = ['id', 'name', 'creator', 'creator_username', 'start_date', 'end_date', 'is_active','participant_count']
        read_only_fields = ['creator','creator_username','participant_count']  # The creator will be set to the current user

    def get_creator_username(self, obj):
        return obj.creator.username if obj.creator and hasattr(obj.creator, 'username') else None
    
    def get_participant_count(self, obj):
        return obj.participants.count()

    def create(self, validated_data):
        user = self.context['request'].user
        # check if already joind to a tournament
        if TournamentParticipant.objects.filter(participant=user).exists():
            raise ValidationError('You are already participating in a tournament.')
        # Set the creator to the user who made the request
        validated_data['creator'] = user
        return super().create(validated_data)

class TournamentParticipantSerializer(serializers.ModelSerializer):
    participant_username = serializers.SerializerMethodField()
    participant_avatar_url = serializers.SerializerMethodField()
    tournament_name = serializers.CharField(write_only=True)

    class Meta:
        model = TournamentParticipant
        fields = ['id', 'tournament_name', 'participant_username' ,'participant_avatar_url', 'date_joined']
        read_only_fields = ['participant', 'date_joined']

    def validate_tournament_name(self, value):
        # Check if the tournament with the given name exists
        try:
            print("hello my name is " + value)
            tournament = Tournament.objects.get(name=value)
            return tournament
        except Tournament.DoesNotExist:
            raise serializers.ValidationError("Tournament with this name does not exist.")

    def get_participant_username(self, obj):
        # Return the username of the participant
        return obj.participant.username
    
    def get_participant_avatar_url(self, obj):
        return obj.participant.avatar_url
    
    def create(self, validated_data):
        user = self.context['request'].user

        # Check if the user is already participating in a tournament
        if TournamentParticipant.objects.filter(participant=user).exists():
            raise serializers.ValidationError('You are already participating in a tournament.')

        # Get the tournament from the validated data
        tournament = validated_data.pop('tournament_name')

        # Create the TournamentParticipant instance
        tournament_participant = TournamentParticipant.objects.create(
            participant=user,
            tournament=tournament
        )

        return tournament_participant

class MatchUpdateSerializer(serializers.ModelSerializer):
    winner_username = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Match
        fields = ['winner', 'winner_username']  # Include other fields as needed
        extra_kwargs = {'winner': {'read_only': True}}

    def update(self, instance, validated_data):
        winner_username = validated_data.pop('winner_username', None)
        if winner_username:
            try:
                winner_user = CustomUser.objects.get(username=winner_username)
                instance.winner = winner_user
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError({"winner_username": "User with this username does not exist"})
        instance.save()
        return instance


class NormalMatchUpdateSerializer(serializers.ModelSerializer):
    winner_username = serializers.CharField(write_only=True, required=False)
    score = serializers.IntegerField(required=False)  # Add score field

    class Meta:
        model = Match
        fields = ['winner', 'winner_username']
        extra_kwargs = {'winner': {'read_only': True}}

    def update(self, instance, validated_data):
        winner_username = validated_data.pop('winner_username', None)
        if winner_username:
            try:
                winner_user = CustomUser.objects.get(username=winner_username)
                instance.winner = winner_user
            except CustomUser.DoesNotExist:
                raise serializers.ValidationError({"winner_username": "User with this username does not exist"})


        instance.save()
        return instance



class MatchResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchResult
        fields = '__all__'


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'avatar_url']
    

class MatchTournamentSerializer(serializers.ModelSerializer):
    player1_details = UserDetailSerializer(source='player1', read_only=True)
    player2_details = UserDetailSerializer(source='player2', read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'tournament', 'player1_details', 'player2_details', 'match_date', 'round_number']


class MatchSerializer(serializers.ModelSerializer):
    player1 = CustomUserSerializer(read_only=True)
    player2 = CustomUserSerializer(read_only=True)
    match_results = MatchResultSerializer(many=True, read_only=True, source='matchresult_set')  # Adjust the source as per related_name


    class Meta:
        model = Match
        fields = ['id', 'tournament', 'player1', 'player2', 'winner', 'match_date', 'round_number','match_results']

