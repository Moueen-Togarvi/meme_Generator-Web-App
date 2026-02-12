import secrets

# Generate a secure secret key for Django
secret_key = secrets.token_urlsafe(50)

print("Add this to your .env file:")
print(f"DJANGO_SECRET_KEY={secret_key}")
