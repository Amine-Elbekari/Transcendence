# Generated by Django 4.2.10 on 2024-02-21 18:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('player', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='two_factor_secret',
            field=models.CharField(blank=True, max_length=100),
        ),
    ]
