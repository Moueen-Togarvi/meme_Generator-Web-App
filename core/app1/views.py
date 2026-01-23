import json
import requests
from django.shortcuts import render
import base64
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.base import ContentFile
from django.conf import settings
from django.core.cache import cache
from .models import UserMeme
import logging

# Configure logging
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
                trending_memes = [{'id': meme['id'], 'url': meme['url'], 'name': meme['name']} for meme in memes[:8]]  # Reduced to 8 memes
                # Cache for 1 hour
                cache.set('trending_memes', trending_memes, 3600)
                return trending_memes
        return []
    except requests.RequestException as e:
        logger.error(f"Error fetching memes from Imgflip API: {e}")
        return []

def meme_editor(request):
    # Fetch trending memes from cache or API
    trending_memes = fetch_trending_memes()
    return render(request, 'meme_editor.html', {'templates': trending_memes})

@csrf_exempt
def save_meme(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            template_url = data.get('template_url')
            top_text = data.get('top_text', '')
            bottom_text = data.get('bottom_text', '')
            image_data = data.get('image_data')

            if not template_url or not image_data:
                return JsonResponse({'error': 'Template URL and image data are required'}, status=400)

            # Decode base64 image data
            format, imgstr = image_data.split(';base64,')
            ext = format.split('/')[-1]
            image_file = ContentFile(base64.b64decode(imgstr), name=f'meme.{ext}')

            # Save the meme
            meme = UserMeme.objects.create(
                template_url=template_url,
                top_text=top_text,
                bottom_text=bottom_text,
                image=image_file
            )
            return JsonResponse({'message': 'Meme saved successfully', 'meme_url': meme.image.url})
        except Exception as e:
            logger.error(f"Error saving meme: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Invalid request'}, status=400)