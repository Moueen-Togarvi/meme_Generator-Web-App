#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Run migrations and collect static files inside the core folder
cd core
python manage.py collectstatic --noinput
