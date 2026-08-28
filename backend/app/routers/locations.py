from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Listing, ListingStatus
from app.utils.maps import calculate_distance_km, geocode_address
from app.schemas.listing import ListingResponse

router = APIRouter(prefix="/locations", tags=["Locations & Maps"])

@router.get("/geocode")
async def geocode(address: str = Query(..., min_length=2)):
    """Geocode address string into lat/lng coordinates."""
    result = await geocode_address(address)
    return result

@router.get("/nearby", response_model=List[ListingResponse])
def get_nearby_listings(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_km: float = Query(25.0, ge=1.0, le=500.0),
    db: Session = Depends(get_db)
):
    """Find listings within specified radius in kilometers."""
    active_listings = db.query(Listing).filter(
        Listing.status == ListingStatus.ACTIVE,
        Listing.is_visible == True
    ).all()

    nearby = []
    for item in active_listings:
        dist = calculate_distance_km(lat, lng, item.latitude, item.longitude)
        if dist <= radius_km:
            nearby.append(item)

    return nearby
