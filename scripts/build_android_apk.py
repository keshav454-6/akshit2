import os
import sys
import subprocess
import shutil
import zipfile

def run_cmd(cmd, cwd=None):
    cmd_str = ' '.join(cmd) if isinstance(cmd, list) else cmd
    print(f"Running: {cmd_str}")
    res = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, shell=isinstance(cmd, str))
    if res.returncode != 0:
        print(f"FAILED (code {res.returncode}):\nSTDOUT: {res.stdout}\nSTDERR: {res.stderr}")
        raise RuntimeError(f"Command failed with code {res.returncode}")
    if res.stdout:
        print(f"Output: {res.stdout.strip()}")
    return res

def main():
    sdk_root = r"C:\Users\agarw\AppData\Local\Android\Sdk"
    build_tools = os.path.join(sdk_root, "build-tools", "34.0.0")
    android_jar = os.path.join(sdk_root, "platforms", "android-34", "android.jar")
    
    aapt_exe = os.path.join(build_tools, "aapt.exe")
    d8_bat = os.path.join(build_tools, "d8.bat")
    zipalign_exe = os.path.join(build_tools, "zipalign.exe")
    apksigner_bat = os.path.join(build_tools, "apksigner.bat")
    
    project_root = r"c:\Users\agarw\OneDrive\Desktop\akshit2"
    android_dir = os.path.join(project_root, "android")
    app_dir = os.path.join(android_dir, "app")
    src_main = os.path.join(app_dir, "src", "main")
    manifest = os.path.join(src_main, "AndroidManifest.xml")
    res_dir = os.path.join(src_main, "res")
    assets_dir = os.path.join(src_main, "assets")
    java_src_dir = os.path.join(src_main, "java")
    
    build_dir = os.path.join(android_dir, "build_output")
    classes_dir = os.path.join(build_dir, "classes")
    dex_dir = os.path.join(build_dir, "dex")
    gen_dir = os.path.join(build_dir, "gen")
    
    # Clean previous build artifacts
    shutil.rmtree(classes_dir, ignore_errors=True)
    shutil.rmtree(dex_dir, ignore_errors=True)
    shutil.rmtree(gen_dir, ignore_errors=True)
    
    os.makedirs(classes_dir, exist_ok=True)
    os.makedirs(dex_dir, exist_ok=True)
    os.makedirs(gen_dir, exist_ok=True)
    
    print("--- Step 1: Generate R.java with AAPT ---")
    run_cmd([
        aapt_exe, "package", "-f", "-m",
        "-J", gen_dir,
        "-M", manifest,
        "-S", res_dir,
        "-I", android_jar
    ])
    
    print("--- Step 2: Compile Java Source Code with javac ---")
    java_files = []
    for root, _, files in os.walk(java_src_dir):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))
    for root, _, files in os.walk(gen_dir):
        for f in files:
            if f.endswith(".java"):
                java_files.append(os.path.join(root, f))
                
    run_cmd([
        "javac", "-source", "17", "-target", "17",
        "-cp", android_jar,
        "-d", classes_dir
    ] + java_files)
    
    print("--- Step 3: Compile classes to classes.dex using D8 ---")
    class_files = []
    for root, _, files in os.walk(classes_dir):
        for f in files:
            if f.endswith(".class"):
                class_files.append(os.path.join(root, f))
                
    run_cmd([
        d8_bat,
        "--min-api", "24",
        "--lib", android_jar,
        "--output", dex_dir
    ] + class_files)
    
    print("--- Step 4: Package Resources, Manifest & Assets into Base APK ---")
    unaligned_apk = os.path.join(build_dir, "app-unaligned.apk")
    if os.path.exists(unaligned_apk):
        os.remove(unaligned_apk)
        
    run_cmd([
        aapt_exe, "package", "-f",
        "-M", manifest,
        "-S", res_dir,
        "-A", assets_dir,
        "-I", android_jar,
        "--min-sdk-version", "24",
        "--target-sdk-version", "34",
        "--version-code", "1",
        "--version-name", "1.0.0",
        "-F", unaligned_apk
    ])
    
    print("--- Step 5: Add classes.dex into APK using AAPT ---")
    dex_path = os.path.join(dex_dir, "classes.dex")
    run_cmd([aapt_exe, "add", "-v", unaligned_apk, "classes.dex"], cwd=dex_dir)
        
    print("--- Step 6: Zipalign APK (4-byte boundary) ---")
    aligned_apk = os.path.join(build_dir, "app-aligned.apk")
    if os.path.exists(aligned_apk):
        os.remove(aligned_apk)
    run_cmd([zipalign_exe, "-f", "-v", "4", unaligned_apk, aligned_apk])
    
    print("--- Step 7: Create Keystore & Sign APK ---")
    keystore = os.path.join(android_dir, "debug.keystore")
    if not os.path.exists(keystore):
        print("Generating debug keystore...")
        run_cmd([
            "keytool", "-genkeypair", "-v",
            "-keystore", keystore,
            "-alias", "cybershield",
            "-keyalg", "RSA", "-keysize", "2048",
            "-validity", "10000",
            "-storepass", "android",
            "-keypass", "android",
            "-dname", "CN=CyberShield, OU=Security, O=FraudGuard, L=Bangalore, ST=Karnataka, C=IN"
        ])
        
    final_apk = os.path.join(build_dir, "CyberShieldOne-v1.0.apk")
    if os.path.exists(final_apk):
        os.remove(final_apk)
    shutil.copyfile(aligned_apk, final_apk)
    
    run_cmd([
        apksigner_bat, "sign",
        "--ks", keystore,
        "--ks-key-alias", "cybershield",
        "--ks-pass", "pass:android",
        "--key-pass", "pass:android",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        final_apk
    ])
    
    print("--- Step 8: Verify Signature with apksigner ---")
    run_cmd([apksigner_bat, "verify", "--verbose", final_apk])
    
    print("--- Step 9: Verify APK Badging with AAPT ---")
    res_badge = run_cmd([aapt_exe, "dump", "badging", final_apk])
    
    print("--- Step 10: Copy APK to root and Backend Static Directory ---")
    static_android_dir = os.path.join(project_root, "backend", "app", "static", "android")
    os.makedirs(static_android_dir, exist_ok=True)
    target_apk = os.path.join(static_android_dir, "CyberShieldOne.apk")
    shutil.copyfile(final_apk, target_apk)
    
    root_apk = os.path.join(project_root, "CyberShieldOne.apk")
    shutil.copyfile(final_apk, root_apk)
    
    apk_size = os.path.getsize(target_apk)
    print(f"SUCCESS! Signed & Verified APK ready at:\n  - {root_apk}\n  - {target_apk}\n  Size: {apk_size / 1024:.1f} KB")
    
    print("--- Step 11: Create Android Source ZIP ---")
    source_zip = os.path.join(static_android_dir, "CyberShieldOne-Android-Source.zip")
    with zipfile.ZipFile(source_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(android_dir):
            if "build_output" in root or ".gradle" in root:
                continue
            for file in files:
                filepath = os.path.join(root, file)
                arcname = os.path.relpath(filepath, android_dir)
                zipf.write(filepath, arcname)
    zip_size = os.path.getsize(source_zip)
    print(f"SUCCESS! Android Source ZIP ready at {source_zip} ({zip_size / 1024:.1f} KB)")

if __name__ == "__main__":
    main()
