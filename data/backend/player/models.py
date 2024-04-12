from django.db import models
from django.contrib.auth.models import AbstractUser
import pyotp

class CustomUser(AbstractUser):
    wins = models.PositiveIntegerField(default=0)
    loses = models.PositiveIntegerField(default=0)
    numberWinsTournament = models.PositiveIntegerField(default=0)
    avatar_url = models.URLField(blank=True, null=True)
    is_change_pic = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)  # Add a boolean field
    upload_pic = models.ImageField(upload_to='uploaded_pics/', blank=True, null=True)
    two_factor_secret = models.CharField(max_length=100, blank=True)
    qr_is_scanned = models.BooleanField(default=False)  # Add a boolean field
    def generate_two_factor_secret(self):
        if self.two_factor_secret is None or self.two_factor_secret == '':
            self.two_factor_secret = pyotp.random_base32()
            self.save()

class Token(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Token for {self.user.username}"
    
class Friendship(models.Model):
    user1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="friendship_user1")
    user2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="friendship_user2")
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=(('pending', 'Pending'), ('accepted', 'Accepted')), default='pending')

    class Meta:
        unique_together = ('user1', 'user2')

    def __str__(self):
        return f"{self.user1} and {self.user2} - {self.status}"

# Create your models here.
