from django.urls import path
from . import views

urlpatterns = [
    path('', views.meme_editor, name='meme_editor'),
    path('fetch-memes/', views.fetch_trending_memes, name='fetch_memes'),
    path('save-meme/', views.save_meme, name='save_meme'),
]