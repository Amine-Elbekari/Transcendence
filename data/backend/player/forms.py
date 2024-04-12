from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
from django import forms


class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = UserCreationForm.Meta.fields + ("avatar_url",)


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = UserChangeForm.Meta.fields

class UserEditForm(forms.ModelForm):
    #image = forms.ImageField(required=False)  # Image upload field (optional)

    class Meta:
        model = CustomUser
        fields = ['username','upload_pic']
