from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.auth import UserCreate, UserLogin, Token, UserResponse
from app.services.auth_service import (
    create_user, authenticate_user, get_user_by_email,
    get_current_user, log_audit
)
from app.core.security import create_access_token
from app.models.entities import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    user = create_user(db, user_in)
    log_audit(db, action="USER_REGISTERED", user_id=user.id, entity_type="User", entity_id=user.id)
    return user

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")
        
    access_token = create_access_token(subject=user.id, role=user.role)
    log_audit(db, action="USER_LOGIN", user_id=user.id, entity_type="User", entity_id=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name,
        "email": user.email
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

