#!/bin/bash

# # Check if the virtual environment exists, if not, create it
# if [ ! -d "/usr/src/app/venv" ]; then 
#     python3 -m venv venv
#     source /usr/src/app/venv/bin/activate
#     pip3 install psycopg2-binary
#     pip3 install -r /requirements.txt
#     else
#         source /usr/src/app/venv/bin/activate

# fi

# python manage.py migrate
# # Start the Django server
# python3 manage.py runserver 0.0.0.0:8000

# Check if the virtual environment exists, if not, create it
if [ ! -d "/usr/src/app/venv" ]; then 
    python3 -m venv venv
fi

# Activate the virtual environment
source /usr/src/app/venv/bin/activate

# Install requirements from requirements.txt
pip3 install -r /requirements.txt

# Run Django migrations
python manage.py migrate

# Start the Django server
python3 manage.py runserver 0.0.0.0:8000
