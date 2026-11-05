# 📦 AnimaFind Build, Signing & Release Guide

This document describes how to generate production-ready application bundles for **Android** and **iOS**, configure code signing, and operate automated CI/CD release pipelines.

---

## 🤖 Android Production Builds

### 1. Android Release Prerequisites
- **JDK 21** (`java -version`)
- **Android SDK API 36** with Build-Tools
- Gradle 8.13 wrapper (`./gradlew`)

### 2. Generating a Release Keystore
To sign your release APK or Android App Bundle (AAB) for Google Play distribution, generate a production keystore (if you do not have one already):

```bash
keytool -genkey -v -keystore animafind-release.keystore \
  -alias animafind-key -keyalg RSA -keysize 2048 -validity 10000
```

> ⚠️ **CRITICAL SECURITY RULE:** Never commit `*.keystore` or `*.jks` files into git! Keep them backed up securely in your password manager or vault.

### 3. Local Release Signing Configuration
You can supply credentials using environment variables:

```bash
export ANDROID_KEYSTORE_PATH="/absolute/path/to/animafind-release.keystore"
export ANDROID_KEYSTORE_PASSWORD="your-keystore-password"
export ANDROID_KEY_ALIAS="animafind-key"
export ANDROID_KEY_PASSWORD="your-key-password"
```

Or by defining them in `~/.gradle/gradle.properties`:
```properties
MYAPP_RELEASE_STORE_FILE=/path/to/animafind-release.keystore
MYAPP_RELEASE_STORE_PASSWORD=your-keystore-password
MYAPP_RELEASE_KEY_ALIAS=animafind-key
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

### 4. Building the Production Release APK
```bash
# 1. Compile web bundle and sync to Android
npm run build:mobile

# 2. Assemble release APK via Gradle
cd android
./gradlew assembleRelease
```

Generated APKs are located at:
- **Signed (if credentials provided):** `android/app/build/outputs/apk/release/app-release.apk`
- **Unsigned (if credentials omitted):** `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 🍏 iOS Production Builds (macOS & Xcode)

### 1. Prerequisites
- macOS Sonoma or newer
- **Xcode 15+** with iOS 15+ SDK
- Apple Developer Account (for distribution signing)

### 2. Building for Simulator Verification (Unsigned)
```bash
npm run build:mobile
npm run cap:ios
```
Or via command line:
```bash
cd ios/App
xcodebuild -project App.xcodeproj \
  -scheme App \
  -configuration Release \
  -destination "generic/platform=iOS Simulator" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  build
```

### 3. Building a Signed Archive for TestFlight / App Store
1. Open the project in Xcode (`npm run cap:ios`).
2. Under **Signing & Capabilities**, select your Apple Developer Team.
3. Verify the Bundle Identifier: `com.animafind.app`.
4. Choose **Product → Archive** from the menu.
5. In the Xcode Organizer, click **Distribute App** to upload directly to App Store Connect or export an `.ipa`.

---

## 🚀 GitHub Actions Automated Pipelines

AnimaFind includes production-hardened GitHub Actions workflows located in `.github/workflows/`:

### 1. `android-build.yml`
- **Trigger:** Pushes to `main`, pull requests, and manual dispatch.
- **Actions:** Runs TypeScript check, ESLint, automated unit test suite, builds web export, synchronizes with Capacitor, and compiles the Android release APK.
- **Artifact:** Uploads `animafind-android-release` (APK) as a downloadable GitHub Actions artifact.

### 2. `ios-build.yml`
- **Trigger:** Pushes to `main`, pull requests, and manual dispatch.
- **Actions:** Runs on `macos-14`, verifies TypeScript, linting, tests, synchronizes Capacitor, and compiles the iOS project using `xcodebuild`.
- **Artifact:** Uploads `animafind-ios-build` artifact.

### 3. `release.yml`
- **Trigger:** When a version tag is pushed (e.g. `git tag v1.0.0 && git push origin v1.0.0`).
- **Actions:** Builds the production Android APK, collects release notes from git history, and publishes a new **GitHub Release** with the APK asset attached.

---

## 🔐 GitHub Secrets Setup Guide

To enable automated release signing in GitHub Actions, configure the following secrets in your repository settings (**Settings → Secrets and variables → Actions**):

| Secret Name | Description | Example Format |
| :--- | :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore file | `base64 -w 0 release.keystore` |
| `ANDROID_KEYSTORE_PASSWORD` | Password for the release keystore | `SecretKeystorePass123!` |
| `ANDROID_KEY_ALIAS` | Key alias in the keystore | `animafind-key` |
| `ANDROID_KEY_PASSWORD` | Password for the key alias | `SecretKeyPass123!` |
| `APPLE_CERTIFICATE_BASE64` *(Optional)* | Base64-encoded Apple distribution certificate | `.p12` file encoded to base64 |
| `APPLE_CERTIFICATE_PASSWORD` *(Optional)* | Password for the `.p12` certificate | `CertPassword123` |
| `APPLE_PROVISIONING_PROFILE_BASE64` *(Optional)* | Base64-encoded provisioning profile | `.mobileprovision` encoded to base64 |

---

## 🏷️ Versioning & Tagging Releases

AnimaFind adheres to [Semantic Versioning (SemVer)](https://semver.org/):

```bash
# 1. Update version in package.json, android/app/build.gradle, and ios/App/App.xcodeproj
# 2. Update CHANGELOG.md
git add .
git commit -m "chore(release): prepare v1.0.0"

# 3. Create semantic git tag
git tag -a v1.0.0 -m "Release v1.0.0 — Production Mobile Launch"

# 4. Push branch and tag to GitHub
git push origin main --tags
```
This automatically triggers the **Release Pipeline** to compile and publish the official GitHub release.
