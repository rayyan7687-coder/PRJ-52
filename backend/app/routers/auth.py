from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, RefreshToken, UserAuthAccount, UserRole
from app.schemas.schemas import (
    UserCreate, UserLogin, Token, UserResponse,
    RefreshTokenRequest, GoogleAuthRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_access_token
from app.core.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def _issue_tokens_for_user(user: User, db: Session) -> dict:
    access_token = create_access_token(data={"sub": user.id, "role": user.role.value})
    raw_refresh = create_refresh_token(data={"sub": user.id})

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    db_refresh = RefreshToken(
        user_id=user.id,
        token=raw_refresh,
        expires_at=expires_at,
        revoked=False
    )
    db.add(db_refresh)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": raw_refresh,
        "token_type": "bearer"
    }

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    new_user = User(
        name=user_in.name,
        email=user_in.email,
        phone=user_in.phone,
        password_hash=get_password_hash(user_in.password),
        role=user_in.role,
        latitude=user_in.latitude,
        longitude=user_in.longitude,
        address=user_in.address,
        is_verified=False,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    return _issue_tokens_for_user(user, db)

@router.post("/refresh", response_model=Token)
def refresh_token(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(body.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user_id = payload.get("sub")
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == body.refresh_token,
        RefreshToken.revoked == False
    ).first()

    if not db_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or expired")

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or not found")

    # Revoke old refresh token (Token rotation)
    db_token.revoked = True
    db.commit()

    return _issue_tokens_for_user(user, db)

@router.post("/logout")
def logout(body: RefreshTokenRequest, db: Session = Depends(get_db)):
    db_token = db.query(RefreshToken).filter(RefreshToken.token == body.refresh_token).first()
    if db_token:
        db_token.revoked = True
        db.commit()
    return {"message": "Successfully logged out"}

@router.post("/google", response_model=Token)
def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    # Verify Google token or mock payload
    try:
        if settings.GOOGLE_CLIENT_ID:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            id_info = id_token.verify_oauth2_token(
                body.credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID
            )
            email = id_info.get("email")
            name = id_info.get("name", "Google User")
            google_sub = id_info.get("sub")
        else:
            # Fallback for dev / token payload decoding
            payload = decode_access_token(body.credential)
            email = (payload and payload.get("email")) or "google_user@buildloop.com"
            name = (payload and payload.get("name")) or "Google User"
            google_sub = (payload and payload.get("sub")) or "google_123456"
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            name=name,
            email=email,
            password_hash=get_password_hash("OAuthUser_NoPasswordSet_!123"),
            role=body.role or UserRole.BUYER,
            is_verified=True,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    auth_acc = db.query(UserAuthAccount).filter(
        UserAuthAccount.user_id == user.id,
        UserAuthAccount.provider == "google"
    ).first()

    if not auth_acc:
        auth_acc = UserAuthAccount(
            user_id=user.id,
            provider="google",
            provider_user_id=google_sub
        )
        db.add(auth_acc)
        db.commit()

    return _issue_tokens_for_user(user, db)

@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user:
        reset_token = create_access_token(
            data={"sub": user.id, "type": "password_reset"},
            expires_delta=timedelta(hours=1)
        )
        # In production, send via Resend API
        return {"message": "Password reset link sent to email", "reset_token_dev": reset_token}
    return {"message": "If that email exists, a reset link has been sent"}

@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    payload = decode_access_token(body.token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = get_password_hash(body.new_password)
    db.commit()
    return {"message": "Password has been successfully reset"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
