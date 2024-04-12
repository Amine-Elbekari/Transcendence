from django.urls import path
from .views import  (
                     oauth2_login,
                     oauth2_callback,
                     oauth2_google_login,
                     oauth2_google_callback,
                     check_token_exists,
                     set_csrf_token,
                     CustomLogoutView,
                     get_profile,
                     enable_2fa,
                     disable_2fa,
                     check_2fa_required,
                     verify_2fa,
                     getUserLoggedInData,
                     verify_2fa_firsttime,
                     logoutTwoFactor
                     )

from rest_framework.routers import DefaultRouter
from .api_views import (TournamentViewSet,
                        TournamentParticipantViewSet,
                        TournamentMatchesList,
                        GenerateMatchesView,
                        MatchUpdateView,
                        GenerateRoundTwoMatchesView,
                        GenerateFinalMatchView,
                        TournamentParticipantsByTournament,
                        DeleteTournamentView,
                        UserMatchesList,
                        CreateMatchView,
                        NormalMatchUpdateView,
                        TournamentLeft,
                        CheckUserParticipation,
                        TournamentParticipantCount,
                        RetrieveMatchesView
                        )

from .api_game import  (send_invitation,
                        accept_invitation,
                        refuse_invitation)

from .api_users import (UserViewSet,
                        SendInvitationFriendView,
                        AcceptFriendship,
                        RefuseFriendship
                        )

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'tournaments', TournamentViewSet)
router.register(r'join_tournament', TournamentParticipantViewSet)
router.register(r'users', UserViewSet)

# router.register(r'tournament_matches', TournamentMatchesList, basename='tournament-matches')

urlpatterns = [
    #42 oauth
    path('oauth/login/', oauth2_login, name='oauth2_login'),
    path('oauth/callback/', oauth2_callback, name='oauth2_callback'),
    #google oauth oauth2_google_login
    path('oauth/google_login/', oauth2_google_login, name='oauth2_google_login'),
    path('oauth/google_callback/', oauth2_google_callback, name='oauth2_google_callback'),

    #twofactors
    path('enable-2fa/', enable_2fa, name='enable-2fa'),
    path('disable-2fa/', disable_2fa, name='disable-2fa'),
    path('check-2fa-required/', check_2fa_required, name='check-2fa-required'),
    path('verify-2fa/', verify_2fa, name='verify_2fa'),
    path('logoutTwoFactor/',logoutTwoFactor,name='logoutTwoFactor'),
    path('verify-21fa/', verify_2fa_firsttime, name='verify_2fa'),

    path('validToken', check_token_exists, name='check_token_exists'),
    path('set-csrf/', set_csrf_token, name='set-csrf'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),

    #Users Management
    path('me/',getUserLoggedInData,name='getUserLoggedInData'),
    path('user/sendInvitationFriend/', SendInvitationFriendView.as_view(), name='send-invitation-friend'),
    path('user/acceptFriendship/', AcceptFriendship.as_view(), name='accept-friendship'),
    path('user/refuseFriendship/', RefuseFriendship.as_view(), name='refuse-friendship'),
    path('user/<str:username>/',get_profile,name='profile'),
    path('user/check_participation/<str:tournament_name>/', CheckUserParticipation.as_view(), name='check-user-participation'),
    path('user/tournament_participant_count/<str:tournament_name>/', TournamentParticipantCount.as_view(), name='tournament-participant-count'),
    path('user/retrieve_matches/<str:tournament_name>/', RetrieveMatchesView.as_view(), name='retrieve-matches'),
   
    #matches
    path('api/user_matches/', UserMatchesList.as_view(), name='user-matches'),
    path('create_match/', CreateMatchView.as_view(), name='create-match'),
    path('update_match/<int:pk>/', NormalMatchUpdateView.as_view(), name='update-match'),

    #tournament
    path('generate_matches_r1/<str:tournament_name>/', GenerateMatchesView.as_view(), name='generate-matches-r1'),
    path('generate_matches_r2/<int:pk>/', GenerateRoundTwoMatchesView.as_view(), name='generate-matches-r2'),
    path('generate_final/<int:pk>/', GenerateFinalMatchView.as_view(), name='generate-final'),

    path('tournament_matches/<int:pk>/<int:round_number>/', TournamentMatchesList.as_view(), name='tournament-matches'),
    path('match_update/<int:pk>/', MatchUpdateView.as_view(), name='match-update'),
  
    path('tournament_matches_r2/<int:pk>/', TournamentMatchesList.as_view(), name='tournament-matches-r2'),
    path('tournament_participants/<str:tournament_name>/', TournamentParticipantsByTournament.as_view(), name='tournament-participants-by-tournament'),    
    

    path('tournament_left/<str:tournament_name>/', TournamentLeft.as_view(), name='tournament-participants-by-tournament'),


    path('delete_tournament/<int:pk>/', DeleteTournamentView.as_view(), name='delete-tournament'),


    #game
    path('game/send_invitation/<str:receiver_username>/',send_invitation,name='invite_request'),
    path('game/accept_invitation/<int:invitation_id>/',accept_invitation,name='invite_request'),
    path('game/refuse_invitation/<int:invitation_id>/',refuse_invitation,name='invite_request'),
]

urlpatterns += router.urls