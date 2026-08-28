import math
import httpx
from app.core.config import settings

def calculate_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two coordinates using Haversine formula."""
    R = 6371.0  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)

async def geocode_address(address: str) -> dict:
    """Geocode address to latitude and longitude using Google Maps Geocoding API."""
    if not settings.GOOGLE_MAPS_API_KEY:
        # Fallback default location for development
        return {
            "formatted_address": address,
            "latitude": 12.9716,
            "longitude": 77.5946,
            "is_mock": True
        }

    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={settings.GOOGLE_MAPS_API_KEY}"
    async with httpx.AsyncClient() as client:
        res = await client.get(url)
        data = res.json()
        if data.get("status") == "OK" and data.get("results"):
            result = data["results"][0]
            loc = result["geometry"]["location"]
            return {
                "formatted_address": result.get("formatted_address"),
                "latitude": loc["lat"],
                "longitude": loc["lng"],
                "is_mock": False
            }
        return {
            "formatted_address": address,
            "latitude": 12.9716,
            "longitude": 77.5946,
            "is_mock": True
        }
