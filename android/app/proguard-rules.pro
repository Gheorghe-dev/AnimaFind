# ProGuard & R8 configuration rules for AnimaFind (Capacitor Android)

# Preserve WebView JavaScript interfaces for Capacitor bridge communication
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Preserve Capacitor core and plugin bindings
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-keep class * extends com.getcapacitor.Plugin

# Preserve AnimaFind application entry point
-keep class com.animafind.app.** { *; }

# Preserve line numbers and stack trace attributes for production crash reports
-keepattributes *Annotation*
-keepattributes JavascriptInterface
-keepattributes SourceFile,LineNumberTable

# Suppress harmless warnings for optional third-party SDK dependencies
-dontwarn com.google.android.gms.**
-dontwarn okio.**
-dontwarn androidx.**
