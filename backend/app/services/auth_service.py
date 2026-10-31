from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.entities import User, AuditLog
from app.schemas.auth import UserCreate
from app.core.security import verify_password, get_password_hash, decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()

def create_user(db: Session, user_in: UserCreate) -> User:
    hashed_pwd = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role or "analyst",
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

def log_audit(db: Session, action: str, user_id: Optional[str] = None, entity_type: str = "", entity_id: str = "", details: dict = None):
    log = AuditLog(
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=details or {}
    )
    db.add(log)
    db.commit()

def get_current_user(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        # For public demo flexibility, return default analyst if unauthenticated
        default_user = db.query(User).filter(User.email == "analyst@fraudguard.ai").first()
        if default_user:
            return default_user
        return None
        
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if not current_user or current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required"
        )
    return current_user

