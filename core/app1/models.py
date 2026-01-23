from django.db import models
from django.core.validators import MaxLengthValidator

class MemeTemplate(models.Model):
    name = models.CharField(max_length=100, db_index=True)
    image = models.ImageField(upload_to='templates/', null=True, blank=True)
    is_gif = models.BooleanField(default=False, db_index=True)
    is_sticker = models.BooleanField(default=False, db_index=True)
    url = models.URLField(null=True, blank=True, max_length=500)  # For external API templates
    category = models.CharField(max_length=50, default='general', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['category', 'is_gif']),
            models.Index(fields=['name', 'category']),
        ]

    def __str__(self):
        return self.name

class UserMeme(models.Model):
    template = models.ForeignKey(MemeTemplate, on_delete=models.CASCADE, null=True, blank=True, db_index=True)
    image = models.ImageField(upload_to='user_memes/')
    top_text = models.CharField(max_length=200, blank=True, null=True, validators=[MaxLengthValidator(200)])
    bottom_text = models.CharField(max_length=200, blank=True, null=True, validators=[MaxLengthValidator(200)])
    font = models.CharField(max_length=50, default='Impact')
    text_color = models.CharField(max_length=10, default='#ffffff')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['template', 'created_at']),
        ]

    def __str__(self):
        return f"Meme {self.id} - {self.template.name if self.template else 'Custom Upload'}"
