import os
import uuid
from app.core.config import settings

async def upload_image_file(file_content: bytes, filename: str) -> dict:
    """Upload image bytes to Cloudinary or fallback to local/mock store."""
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=settings.CLOUDINARY_CLOUD_NAME,
            api_key=settings.CLOUDINARY_API_KEY,
            api_secret=settings.CLOUDINARY_API_SECRET,
            secure=True
        )
        response = cloudinary.uploader.upload(
            file_content,
            folder="buildloop_listings"
        )
        return {
            "image_url": response.get("secure_url"),
            "public_id": response.get("public_id"),
            "provider": "cloudinary"
        }

    # Fallback for local development / testing without Cloudinary credentials
    mock_id = f"buildloop_img_{uuid.uuid4().hex[:10]}"
    return {
        "image_url": f"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
        "public_id": mock_id,
        "provider": "mock"
    }
