from django.db import models
from player.models import CustomUser

# Create your models here.
class Tournament(models.Model):
    name = models.CharField(max_length=100)
    creator = models.ForeignKey(CustomUser, related_name='created_tournaments', on_delete=models.CASCADE)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    participants = models.ManyToManyField(CustomUser, through='TournamentParticipant', related_name='tournaments')
    winner = models.ForeignKey(CustomUser, related_name='won_tournaments', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

# Model to represent tournament participants
class TournamentParticipant(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)
    participant = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    date_joined = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('tournament', 'participant')

    def __str__(self):
        return f"{self.participant.username} in {self.tournament.name}"

# Match model to represent a single match in the tournament
class Match(models.Model):
    tournament = models.ForeignKey(Tournament, related_name='matches', on_delete=models.CASCADE,null=True, blank=True)
    player1 = models.ForeignKey(CustomUser, related_name='player1_matches', on_delete=models.CASCADE)
    player2 = models.ForeignKey(CustomUser, related_name='player2_matches', on_delete=models.CASCADE, null=True, blank=True)
    winner = models.ForeignKey(CustomUser, related_name='won_matches', on_delete=models.SET_NULL, null=True, blank=True)
    match_date = models.DateTimeField()
    round_number = models.IntegerField(null=True, blank=True)

    def __str__(self):
        match_details = f"{self.player1.username} vs {self.player2.username if self.player2 else 'TBD'}"
        return f"{self.tournament.name} - Round {self.round_number}: {match_details}"

# Optional: MatchResult model
class MatchResult(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    result_data = models.JSONField()  # This can store detailed results, scores, etc.

    def __str__(self):
        return f"Result for {self.match}"
    
#Game Stuff
class GameInvitation(models.Model):
    sender = models.ForeignKey(CustomUser, related_name='sent_invitations', on_delete=models.CASCADE)
    receiver = models.ForeignKey(CustomUser, related_name='received_invitations', on_delete=models.CASCADE)
    room_name = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=[('pending', 'Pending'), ('accepted', 'Accepted')])
    # created_at = models.DateTimeField(auto_now_add=True)
    # updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username} - {self.status}"