from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, UserRole, Listing, Transaction, Report, Category
from app.schemas.schemas import UserResponse
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin & Moderation"])

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required."
        )
    return current_user

@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    total_users = db.query(User).count()
    total_listings = db.query(Listing).count()
    total_transactions = db.query(Transaction).count()
    total_reports = db.query(Report).count()
    total_categories = db.query(Category).count()

    return {
        "users": total_users,
        "listings": total_listings,
        "transactions": total_transactions,
        "reports": total_reports,
        "categories": total_categories
    }

@router.get("/users", response_model=List[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(User).order_by(User.id.desc()).all()

@router.get("/reports")
def list_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return db.query(Report).order_by(Report.id.desc()).all()

@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    return {"message": f"User status updated to is_active={is_active}"}

@router.delete("/listings/{listing_id}")
def admin_delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    listing = db.query(Listing).filter(Listing.id == listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    db.delete(listing)
    db.commit()
    return {"message": f"Listing {listing_id} deleted by administrator."}
