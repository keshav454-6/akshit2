import os
import hashlib
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/download", tags=["Mobile & Downloads"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STATIC_ANDROID_DIR = os.path.join(BASE_DIR, "static", "android")
APK_PATH = os.path.join(STATIC_ANDROID_DIR, "CyberShieldOne.apk")
SOURCE_ZIP_PATH = os.path.join(STATIC_ANDROID_DIR, "CyberShieldOne-Android-Source.zip")

def get_file_sha256(filepath: str) -> str:
    if not os.path.exists(filepath):
        return ""
    sha256_hash = hashlib.sha256()
    with open(filepath, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@router.get("/info")
def get_download_info():
    """Returns metadata, file size, SHA256 checksum and installation steps for CyberShield One Android build."""
    if not os.path.exists(APK_PATH):
        raise HTTPException(status_code=404, detail="Android build file not found.")
    
    apk_size = os.path.getsize(APK_PATH)
    apk_sha = get_file_sha256(APK_PATH)
    
    source_size = os.path.getsize(SOURCE_ZIP_PATH) if os.path.exists(SOURCE_ZIP_PATH) else 0

    return {
        "app_name": "CyberShield One",
        "tagline": "Real-Time Payment Fraud Defense",
        "version": "1.0.0",
        "package_name": "ai.fraudguard.cybershield",
        "min_sdk": "Android 7.0+ (API 24)",
        "target_sdk": "Android 14 (API 34)",
        "apk_filename": "CyberShieldOne.apk",
        "apk_size_bytes": apk_size,
        "apk_size_kb": round(apk_size / 1024, 1),
        "apk_sha256": apk_sha,
        "direct_download_url": "/api/v1/download/android-build",
        "source_download_url": "/api/v1/download/android-source",
        "source_size_kb": round(source_size / 1024, 1),
        "install_instructions": [
            "1. Tap 'Download Android App (.apk)' or scan the QR code with your mobile device.",
            "2. When prompted by Android Chrome/Browser, tap 'Download anyway'.",
            "3. Open the downloaded CyberShieldOne.apk file.",
            "4. If prompted, allow 'Install Unknown Apps' for your mobile browser in Settings.",
            "5. Tap 'Install' and launch CyberShield One."
        ]
    }

@router.get("/android-build")
@router.get("/apk")
@router.head("/android-build")
@router.head("/apk")
def download_android_apk():
    """Directly serves the signed, installable CyberShield One APK package."""
    if not os.path.exists(APK_PATH):
        raise HTTPException(status_code=404, detail="CyberShield One APK not found on server.")
    
    return FileResponse(
        path=APK_PATH,
        media_type="application/vnd.android.package-archive",
        filename="CyberShieldOne.apk",
        headers={
            "Content-Disposition": 'attachment; filename="CyberShieldOne.apk"',
            "Cache-Control": "no-cache"
        }
    )

@router.get("/android-source")
@router.head("/android-source")
def download_android_source():
    """Serves the complete Android Gradle project ZIP source code."""
    if not os.path.exists(SOURCE_ZIP_PATH):
        raise HTTPException(status_code=404, detail="Android source ZIP not found on server.")
    
    return FileResponse(
        path=SOURCE_ZIP_PATH,
        media_type="application/zip",
        filename="CyberShieldOne-Android-Source.zip",
        headers={
            "Content-Disposition": 'attachment; filename="CyberShieldOne-Android-Source.zip"',
            "Cache-Control": "no-cache"
        }
    )
