from django.db import models

class MemeTemplate(models.Model):
    name = models.CharField(max_length=100)
    image = models.ImageField(upload_to='templates/', null=True, blank=True)
    is_gif = models.BooleanField(default=False)
    is_sticker = models.BooleanField(default=False)
    url = models.URLField(null=True, blank=True)  # For external API templates
    category = models.CharField(max_length=50, default='general')

    def __str__(self):
        return self.name

class UserMeme(models.Model):
    template = models.ForeignKey(MemeTemplate, on_delete=models.CASCADE, null=True, blank=True)
    image = models.ImageField(upload_to='user_memes/')
    top_text = models.CharField(max_length=200, blank=True, null=True)
    bottom_text = models.CharField(max_length=200, blank=True, null=True)
    font = models.CharField(max_length=50, default='Impact')
    text_color = models.CharField(max_length=10, default='#ffffff')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Meme {self.id} - {self.template.name if self.template else 'Custom Upload'}"
