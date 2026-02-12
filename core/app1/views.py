import json
import requests
from django.shortcuts import render
import base64
from django.http import JsonResponse
from django.core.files.base import ContentFile
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

# Imgflip API credentials (replace with your own)
IMGFLIP_API_URL = 'https://api.imgflip.com/get_memes'

def fetch_trending_memes():
    # Check cache first
    cached_memes = cache.get('trending_memes')
    if cached_memes:
        return cached_memes
    
    try:
        # Fetch memes from Imgflip API with timeout
        response = requests.get(IMGFLIP_API_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                # Extract meme templates from the API response
                memes = data['data']['memes']
                trending_memes = [{'id': meme['id'], 'url': meme['url'], 'name': meme['name']} for meme in memes]
                # Cache for 1 hour
                cache.set('trending_memes', trending_memes, 3600)
                return trending_memes
        return []
    except requests.RequestException as e:
        logger.error(f"Error fetching memes from Imgflip API: {e}")
        return []

def fetch_trending_memes_api(request):
    """API endpoint to fetch trending memes with server-side caching."""
    memes = fetch_trending_memes()
    return JsonResponse({'success': True, 'data': {'memes': memes}})

def meme_editor(request):
    # Pass templates as JSON for the JavaScript pagination
    trending_memes = fetch_trending_memes()
    context = {
        'templates_json': json.dumps(trending_memes),
        'templates': trending_memes,  # Keep for potential SSR needs
    }
    return render(request, 'meme_editor.html', context)