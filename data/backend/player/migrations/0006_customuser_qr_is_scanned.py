# Generated by Django 4.2.10 on 2024-03-09 20:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0005_friendship'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='qr_is_scanned',
            field=models.BooleanField(default=False),
        ),
    ]