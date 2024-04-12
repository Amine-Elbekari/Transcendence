# api_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import random
from rest_framework import viewsets, permissions
from pong.models import (
    Tournament,
    TournamentParticipant,
    Match,
    MatchResult)
from player.models import CustomUser
from .serializers import (
    TournamentSerializer,
    TournamentParticipantSerializer,
    MatchSerializer,
    MatchUpdateSerializer,
    MatchResultSerializer,
    MatchTournamentSerializer
    )
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from rest_framework import generics
from django.db.models import F  # Used for incrementing a field value
from django.core.exceptions import ValidationError
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import get_object_or_404
from rest_framework import views, status




class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    # permission_classes = [permissions.IsAuthenticated]  # Ensures only authenticated users can create a tournament

    def create(self, request, *args, **kwargs):
        user = request.user
        # Check if the user has already created a tournament
        if Tournament.objects.filter(creator=request.user.id).exists():
            # If yes, return a custom response indicating the user can't create another tournament
            response = {'message': 'A user can create only one tournament.'}
            return Response(response, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_authenticated:
            raise ValidationError('User must be authenticated to create a tournament.')

        # If the user has not created a tournament, proceed with normal creation process
        return super(TournamentViewSet, self).create(request, *args, **kwargs)

class TournamentParticipantViewSet(viewsets.ModelViewSet):
    queryset = TournamentParticipant.objects.all()
    serializer_class = TournamentParticipantSerializer
    http_method_names = ['post', 'put', 'patch', 'delete']
    # permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        participant = serializer.save(participant=self.request.user)
       

class TournamentParticipantsByTournament(generics.ListAPIView):
    serializer_class = TournamentParticipantSerializer

    def get_queryset(self):
        """
        This view returns a list of participants for a given tournament by name,
        excluding the current user if they are a participant.
        """
        tournament_name = self.kwargs['tournament_name']
        tournament = get_object_or_404(Tournament, name=tournament_name)
        current_user = self.request.user

        # Exclude the current user if they are a participant
        return TournamentParticipant.objects.filter(tournament=tournament).exclude(participant=current_user)
    
class TournamentLeft(views.APIView):
    """
    API endpoint that allows users to leave a tournament using POST method.
    """

    def post(self, request, tournament_name, format=None):        
        user = request.user
        tournament = get_object_or_404(Tournament, name=tournament_name)
        participant_record = TournamentParticipant.objects.filter(participant=user, tournament=tournament)

        if participant_record.exists():
            participant_record.delete()
            return Response({"message": "You have successfully left the tournament."}, status=status.HTTP_204_NO_CONTENT)
        else:
            return Response({"error": "You are not a participant in this tournament."}, status=status.HTTP_404_NOT_FOUND)


class TournamentParticipantCount(views.APIView):
    """
    API endpoint that returns the number of participants for a given tournament.
    """

    def get(self, request, tournament_name, format=None):
        tournament = get_object_or_404(Tournament, name=tournament_name)
        participant_count = TournamentParticipant.objects.filter(tournament=tournament).count()

        return Response({'participant_count': participant_count})

class NoPagination(PageNumberPagination):
    page_size = None



class TournamentMatchesList(generics.ListAPIView):
    serializer_class = MatchSerializer

    def get_queryset(self):
        """
        This view returns a list of all matches for a given tournament.
        """
        tournament_id = self.kwargs['pk']
        round_number = self.kwargs['round_number']
        return Match.objects.filter(tournament_id=tournament_id,round_number=round_number)
    

class CheckUserParticipation(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, tournament_name, format=None):
        tournament = get_object_or_404(Tournament, name=tournament_name)
        user = request.user

        is_participant = TournamentParticipant.objects.filter(tournament=tournament, participant=user).exists()
        
        return Response({'is_participant': is_participant})


class UserMatchesList(generics.ListAPIView):
    serializer_class = MatchSerializer
    # permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get_queryset(self):
        """
        This view returns a list of all matches where the authenticated user has participated.
        """
        user = self.request.user.id
        return Match.objects.filter(player1=user) | Match.objects.filter(player2=user)
    

class CreateMatchView(APIView):
    def post(self, request, *args, **kwargs):
        player1_username = request.data.get('player1_username')
        player2_username = request.data.get('player2_username')

        # Find the users based on the provided usernames
        try:
            player1 = CustomUser.objects.get(username=player1_username)
            player2 = CustomUser.objects.get(username=player2_username)
        except CustomUser.DoesNotExist:
            return Response({"error": "One or both users not found."}, status=status.HTTP_404_NOT_FOUND)

        # Create the match
        match_date = timezone.now()
        match = Match(player1=player1, player2=player2, match_date=match_date)
        match.save()

        return Response({"message": "Match created successfully.", "match_id": match.id}, status=status.HTTP_201_CREATED)


class GenerateMatchesView(APIView):
    def post(self, request, tournament_name, format=None):
        tournament = get_object_or_404(Tournament, name=tournament_name)

        existing_matches = Match.objects.filter(tournament=tournament)
        if existing_matches.count() == 8:
            # Serialize and return the existing matches
            serialized_matches = MatchTournamentSerializer(existing_matches, many=True).data
            return Response({'message': 'Existing matches retrieved successfully.', 'matches': serialized_matches})

        # Check if the tournament has exactly 8 participants
        participants = list(tournament.participants.all())
        if len(participants) != 8:
            return Response({'error': 'Tournament must have exactly 8 participants.'}, status=status.HTTP_400_BAD_REQUEST)

        # Shuffle the participants and pair them into matches
        matches = []
        random.shuffle(participants)
        for i in range(0, len(participants), 2):
            match = Match.objects.create(
                tournament=tournament,
                player1=participants[i],
                player2=participants[i + 1],
                match_date=timezone.now(),
                round_number=1
            )
            matches.append(match)

        # Serialize the newly created matches
        serialized_matches = MatchTournamentSerializer(matches, many=True).data
        return Response({'message': 'Matches generated successfully.', 'matches': serialized_matches})
    
class RetrieveMatchesView(generics.ListAPIView):
    serializer_class = MatchTournamentSerializer

    def get_queryset(self):
        """
        This view returns a list of matches for a given tournament by name.
        """
        tournament_name = self.kwargs['tournament_name']
        tournament = get_object_or_404(Tournament, name=tournament_name)
        return Match.objects.filter(tournament=tournament)
        
class MatchUpdateView(APIView):
    def post(self, request, pk, format=None):
        try:
            match = Match.objects.get(pk=pk)
            serializer = MatchUpdateSerializer(match, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                # *** check if the username passed , is in match

                # Optionally, handle match result logic here
                match_result_data = request.data.get('match_result')
                if match_result_data:
                    match_result, created = MatchResult.objects.update_or_create(
                        match=match, defaults=match_result_data
                    )
                    # You might want to include the match result data in the response
                    match_result_serializer = MatchResultSerializer(match_result)
                
                     # Increment win count for the winner
                    if match.winner:
                        CustomUser.objects.filter(pk=match.winner.pk).update(wins=F('wins') + 1)

                    # Increment loss count for the loser, if applicable
                    loser = self.get_match_loser(match)
                    if loser:
                        CustomUser.objects.filter(pk=loser.pk).update(loses=F('loses') + 1)

                    # Check if the match is a tournament final and increment tournament wins
                    if self.is_tournament_final(match):
                        CustomUser.objects.filter(pk=match.winner.pk).update(numberWinsTournament=F('numberWinsTournament') + 1)

                # Prepare the response data
                response_data = serializer.data
                if match_result_data:
                    response_data['match_result'] = match_result_serializer.data

                return Response(response_data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
    
    def get_match_loser(self, match):
        # Logic to determine the loser of the match
        if match.winner:
            return match.player1 if match.winner == match.player2 else match.player2
        return None
    def is_tournament_final(self, match):
        """
        Check if the given match is the final of the tournament.
        Assumes that the final match is always in round 3.
        """
        return match.round_number == 3
    

class NormalMatchUpdateView(APIView):
    def post(self, request, pk, format=None):
        try:
            match = Match.objects.get(pk=pk,tournament__isnull=True)

            # Check if the match is part of a tournament; if so, return an error
            if match.tournament:
                return Response({'error': 'Cannot update a tournament match.'}, status=status.HTTP_400_BAD_REQUEST)

            serializer = NormalMatchUpdateView(match, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()

                # Update win/loss counts
                match_result_data = request.data.get('match_result')
                if match_result_data:
                    match_result, created = MatchResult.objects.update_or_create(
                        match=match, defaults=match_result_data
                    )
                    # You might want to include the match result data in the response
                    match_result_serializer = MatchResultSerializer(match_result)
                
                     # Increment win count for the winner
                    if match.winner:
                        CustomUser.objects.filter(pk=match.winner.pk).update(wins=F('wins') + 1)

                    # Increment loss count for the loser, if applicable
                    loser = self.get_match_loser(match)
                    if loser:
                        CustomUser.objects.filter(pk=loser.pk).update(loses=F('loses') + 1)

                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Match.DoesNotExist:
            return Response({'error': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

    def get_match_loser(self, match):
        if match.winner:
            return match.player1 if match.winner == match.player2 else match.player2
        return None



class GenerateRoundTwoMatchesView(APIView):
    def post(self, request, pk, format=None):
        try:
            tournament = Tournament.objects.get(pk=pk)

            # Get all first-round matches and their winners, ordered by match ID
            first_round_matches = Match.objects.filter(
                tournament=tournament,
                round_number=1,
                winner__isnull=False
            ).order_by('id')

            winners = [match.winner for match in first_round_matches]

            # Check if there are exactly 4 winners
            if len(winners) != 4:
                return Response({'error': 'There must be exactly 4 winners from the first round.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Create second-round matches
            second_round_matches = []
            for i in range(0, len(winners), 2):
                match = Match.objects.create(
                    tournament=tournament,
                    player1=winners[i],
                    player2=winners[i + 1],
                    match_date=timezone.now(),
                    round_number=2
                )
                second_round_matches.append(match)

            # Serialize the new matches to include them in the response
            return Response({'message': 'Round 2 matches generated successfully.'})
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
        
class GenerateFinalMatchView(APIView):
    def post(self, request, pk, format=None):
        try:
            # Ensure the tournament exists
            tournament = Tournament.objects.get(pk=pk)

            # Get all second-round matches and their winners
            second_round_winners = Match.objects.filter(
                tournament=tournament,
                round_number=2,
                winner__isnull=False
            ).order_by('winner_id').values_list('winner', flat=True)

            # Check if there are exactly 2 winners
            if len(second_round_winners) != 2:
                return Response({'error': 'There must be exactly 2 winners from the second round.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # Create the final match
            final_match = Match.objects.create(
                tournament=tournament,
                player1_id=second_round_winners[0],
                player2_id=second_round_winners[1],
                 match_date=timezone.now(),
                round_number=3  # Assuming 3 is the round number for the final
            )

            return Response({'message': 'Final match generated successfully.', 'final_match_id': final_match.id})
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)
        
class DeleteTournamentView(APIView):
    #permission_classes = [permissions.IsAuthenticated, permissions.IsAdminUser]  # Adjust as needed

    def get(self, request, pk, format=None):
        try:
            tournament = Tournament.objects.get(pk=pk)
            # Add additional checks here to ensure the user has the right to delete the tournament
            tournament.delete()
            return Response({'message': 'Tournament and all related matches and results have been deleted.'}, status=status.HTTP_204_NO_CONTENT)
        except Tournament.DoesNotExist:
            return Response({'error': 'Tournament not found.'}, status=status.HTTP_404_NOT_FOUND)