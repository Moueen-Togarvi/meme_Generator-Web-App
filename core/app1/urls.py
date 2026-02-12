from django.urls import path
from . import views
from django.urls import re_path
from django.views.static import serve
from django.conf import settings
import os

urlpatterns = [
    re_path(r'^ads\.txt$', serve, {
        'path': 'ads.txt',
        'document_root': os.path.join(settings.BASE_DIR, 'static'),
    }),
    path('', views.meme_editor, name='meme_editor'),
    path('fetch-memes/', views.fetch_trending_memes_api, name='fetch_memes'),
]