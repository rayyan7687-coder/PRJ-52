from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from app.core.dependencies import get_current_user
from app.models.models import User
from app.utils.cloudinary import upload_image_file

router = APIRouter(prefix="/upload", tags=["Uploads"])

ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
MAX_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type. Only JPEG, PNG, and WebP images are allowed."
        )

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 10MB."
        )

    result = await upload_image_file(content, file.filename)
    return result
