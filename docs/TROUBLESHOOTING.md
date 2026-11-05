# 🔧 AnimaFind Troubleshooting & Common Issues Guide

This document covers solutions to common installation, environment, build, and runtime issues.

---

## 💻 1. Web & Local Development Issues

### Issue: "Camera API not supported" or Camera Permission Denied
- **Cause:** Modern browsers enforce secure context restrictions on `navigator.mediaDevices.getUserMedia`. WebRTC is blocked on insecure HTTP origins other than `http://localhost`.
- **Solution:**
  1. Access the web app exclusively via `http://localhost:3000` (not via raw local IP like `http://192.168.x.x:3000` unless HTTPS is configured).
  2. In your browser settings, ensure Camera permission is granted for `localhost`.
  3. If testing in an environment without a physical webcam, click the **🎲 Specimen Simulator button** in the viewfinder to simulate valid camera frames.

### Issue: "DATABASE_URL is required" Error
- **Cause:** Running scripts that import database entities without environment variables loaded.
- **Solution:**
  1. Ensure you have copied `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
  2. The application includes a safe fallback for local/offline execution, but having `.env` present ensures all scripts resolve properly.

### Issue: Port 3000 Already in Use
- **Cause:** Another process or development server is listening on port 3000.
- **Solution:**
  ```bash
  # Launch Next.js on an alternate port
  npx next dev -p 3001
  ```

---

## 🤖 2. Android Build & Gradle Issues

### Issue: "Unsupported class file major version" or "Incompatible JVM"
- **Cause:** Android Gradle Plugin 8.13 requires **Java JDK 21**. Running with Java 8 or Java 11 will cause Gradle initialization to fail.
- **Solution:**
  1. Verify your active Java version:
     ```bash
     java -version
     ```
  2. Point your `JAVA_HOME` explicitly to JDK 21 before building:
     ```bash
     # Windows PowerShell
     $env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"
     $env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

     # macOS / Linux
     export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"
     ```

### Issue: "SDK location not found"
- **Cause:** Missing `ANDROID_HOME` or `local.properties` in `./android`.
- **Solution:**
  1. Create or edit `android/local.properties`:
     ```properties
     # Windows path example
     sdk.dir=C\:\\Users\\Alex\\AppData\\Local\\Android\\Sdk

     # macOS path example
     sdk.dir=/Users/username/Library/Android/sdk
     ```

### Issue: "Could not find compileDebugJavaWithJavac" or Out of Memory
- **Cause:** Insufficient heap space allocated to the Gradle daemon.
- **Solution:**
  Ensure `android/gradle.properties` includes adequate JVM heap:
  ```properties
  org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
  ```

---

## 🍏 3. iOS Build & Xcode Issues

### Issue: "Capacitor/Capacitor.h file not found"
- **Cause:** CocoaPods or Swift Package Manager cache is stale after updating dependencies.
- **Solution:**
  ```bash
  # Re-run the mobile sync pipeline
  npm run build:mobile
  ```

### Issue: "Signing for 'App' requires a development team"
- **Cause:** Xcode requires an Apple Developer Team for code signing when building for physical devices.
- **Solution:**
  1. For simulator testing, signing is not required. Run with the iOS Simulator destination.
  2. For physical device deployment: Open `ios/App/App.xcodeproj` in Xcode, navigate to **Signing & Capabilities**, and select your personal or organization Apple Developer Team.

---

## 📲 4. Capacitor & Static Export Issues

### Issue: API Routes Missing in Static Export
- **Cause:** Next.js static site generation (`output: "export"`) does not support server-rendered Node.js API endpoints.
- **Solution:**
  The project includes [`scripts/build-mobile.cjs`](file:///c:/Users/Alex/Desktop/AnimaFind/scripts/build-mobile.cjs), which automatically stashes `src/app/api` during static generation and restores it immediately afterward. Always use:
  ```bash
  npm run build:mobile
  ```
  instead of running a bare `next build` when targeting native mobile devices.

### Issue: Storage Quota Exceeded in Mobile WebView
- **Cause:** Storing high volumes of raw base64 images in `localStorage` exceeds the 5MB browser quota.
- **Solution:**
  AnimaFind's [`LocalStoreEngine`](file:///c:/Users/Alex/Desktop/AnimaFind/src/lib/local-store.ts) automatically utilizes **IndexedDB** (`animafind_db`) as primary storage (which supports hundreds of megabytes), and automatically prunes older raw image buffers in localStorage if a quota limit is detected, while keeping card data, stats, and thumbnails completely intact.
