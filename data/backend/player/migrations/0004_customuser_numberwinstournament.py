# Generated by Django 4.2.10 on 2024-02-27 08:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0003_token'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='numberWinsTournament',
            field=models.PositiveIntegerField(default=0),
        ),
    ]
