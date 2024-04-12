from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import CustomUserCreationForm, CustomUserChangeForm



from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import (CustomUser,Friendship,Token)

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser
    list_display = [
        "id",
        "username", 
        #"avatar_url", 
        "wins", 
        "loses",
        "numberWinsTournament",
        "is_change_pic",
        "upload_pic",
        "is_online",
        "two_factor_secret",
        "qr_is_scanned"
        ]

    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('avatar_url', 'is_change_pic', 'upload_pic','wins','loses','numberWinsTournament','two_factor_secret', "qr_is_scanned")}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('avatar_url', 'is_change_pic', 'upload_pic','wins','loses','numberWinsTournament','two_factor_secret', "qr_is_scanned")}),
    )



class TokenAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "token",
        "created_at",
        
    ]


class FriendshipAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "user1",
        "user2",
        "created_at",
        "status"
        ]

    # fieldsets = UserAdmin.fieldsets + (
    #     (None, {'fields': ('avatar_url', 'is_change_pic', 'upload_pic','wins','loses','numberWinsTournament')}),
    # )
    # add_fieldsets = UserAdmin.add_fieldsets + (
    #     (None, {'fields': ('avatar_url', 'is_change_pic', 'upload_pic','wins','loses','numberWinsTournament')}),
    # )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Token, TokenAdmin)
admin.site.register(Friendship, FriendshipAdmin)