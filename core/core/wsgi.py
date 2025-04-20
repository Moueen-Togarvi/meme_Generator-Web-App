"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()



# {
#   "version": 2,
#   "builds": [
#     { "src": "api/index.py", "use": "@vercel/python" }
#   ],
#   "routes": [
#     { "src": "/(.*)", "dest": "api/index.py" }
#   ]
# }
