import os
import sys

# Add the 'core' directory (which contains manage.py and the inner 'core' settings) to the path
path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'core'))
sys.path.insert(0, path)

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "core.settings")
app = get_wsgi_application()
