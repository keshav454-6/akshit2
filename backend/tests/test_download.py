import unittest
from fastapi.testclient import TestClient
from app.main import app

class DownloadTestCase(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_download_info(self):
        res = self.client.get("/api/v1/download/info")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["app_name"], "CyberShield One")
        self.assertEqual(data["package_name"], "ai.fraudguard.cybershield")
        self.assertIn("apk_sha256", data)
        self.assertTrue(data["apk_size_kb"] > 0)
        print("[PASS] Download Info Endpoint Verified")

    def test_download_apk_file(self):
        res = self.client.get("/api/v1/download/android-build")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("content-type"), "application/vnd.android.package-archive")
        self.assertIn('filename="CyberShieldOne.apk"', res.headers.get("content-disposition", ""))
        self.assertTrue(len(res.content) > 100000)
        print(f"[PASS] Download APK Package Verified (Bytes: {len(res.content)})")

    def test_download_source_zip(self):
        res = self.client.get("/api/v1/download/android-source")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.headers.get("content-type"), "application/zip")
        self.assertIn('filename="CyberShieldOne-Android-Source.zip"', res.headers.get("content-disposition", ""))
        self.assertTrue(len(res.content) > 100000)
        print(f"[PASS] Download Android Source Zip Verified (Bytes: {len(res.content)})")

if __name__ == "__main__":
    unittest.main()

