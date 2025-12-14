# Backend/medical/validators.py (create this file)
import magic
from PIL import Image
from django.core.exceptions import ValidationError

def validate_file_upload(file):
    # Size check
    if file.size > 5 * 1024 * 1024:  # 5MB
        raise ValidationError("File too large (max 5MB)")
    
    # Extension check
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ['.pdf', '.jpg', '.jpeg', '.png']:
        raise ValidationError(f"File type {ext} not allowed")
    
    # MIME type verification
    mime = magic.from_buffer(file.read(1024), mime=True)
    file.seek(0)
    
    allowed_mimes = {
        'application/pdf': ['.pdf'],
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png']
    }
    
    if mime not in allowed_mimes or ext not in allowed_mimes[mime]:
        raise ValidationError("File content doesn't match extension")
    
    # For images, verify integrity
    if mime.startswith('image/'):
        try:
            img = Image.open(file)
            img.verify()
            file.seek(0)
        except Exception:
            raise ValidationError("Corrupted or invalid image file")
    
    return file