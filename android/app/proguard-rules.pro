# CyberShield One Proguard Rules
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keep class ai.fraudguard.cybershield.** { *; }

