# vercel_build.py
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
app = get_wsgi_application()



# # {
#     "version": 2,
#     "builds": [
#       { "src": "api/index.py", "use": "@vercel/python" }
#     ],
#     "routes": [
#       { "src": "/(.*)", "dest": "api/index.py" }
#     ]
#   }
