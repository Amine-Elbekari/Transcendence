from django.contrib import admin
from .models import (   Tournament,
                        TournamentParticipant,
                        Match,
                        MatchResult,
                        GameInvitation 
                         )

# Admin view for Tournament
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('id','name', 'creator', 'start_date', 'end_date', 'is_active')
    search_fields = ('name', 'creator__username')

# Admin view for TournamentParticipant
class TournamentParticipantAdmin(admin.ModelAdmin):
    list_display = ('tournament', 'participant', 'date_joined')
    search_fields = ('tournament__name', 'participant__username')
    list_filter = ('tournament',)

# Admin view for Match
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id','tournament', 'player1', 'player2', 'winner', 'match_date', 'round_number')
    search_fields = ( 'player1__username', 'player2__username')
    list_filter = ('tournament', 'round_number')

# Admin view for MatchResult
class MatchResultAdmin(admin.ModelAdmin):
    list_display = ('match', 'result_data')
    search_fields = ('match__tournament__name', 'match__player1__username', 'match__player2__username')

class MatchResultAdmin(admin.ModelAdmin):
    list_display = ('match', 'result_data')
    search_fields = ('match__tournament__name', 'match__player1__username', 'match__player2__username')


# Optional: Customizing the admin interface
class GameInvitationAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'room_name', 'status')  # Fields to display in the admin list view
    list_filter = ('status',)  # Filters
    search_fields = ('sender__username', 'receiver__username', 'room_name')  # Searchable fields

# Register your models here
admin.site.register(Tournament, TournamentAdmin)
admin.site.register(TournamentParticipant, TournamentParticipantAdmin)
admin.site.register(Match, MatchAdmin)
admin.site.register(MatchResult, MatchResultAdmin)
admin.site.register(GameInvitation, GameInvitationAdmin)

