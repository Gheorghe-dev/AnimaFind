# 🛠️ AnimaFind Development Environment Setup Guide

This guide provides exact step-by-step instructions for configuring your workstation to develop, test, and build **AnimaFind** locally and for native mobile targets (Android & iOS).

---

## 📋 System Prerequisites

| Tool | Required Version | Verification Command | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 20.0.0` (v22 / v24 LTS recommended) | `node --version` | Runtime for Next.js and build tooling |
| **npm** | `>= 10.0.0` | `npm --version` | Package manager |
| **JDK (Java)** | `21 LTS` (e.g. Eclipse Temurin or OpenJDK 21) | `java -version` | Required by Android Gradle Plugin 8.13 |
| **Android Studio** | Ladybug / Otter or newer | Android Studio UI | Provides Android SDK, build tools & emulators |
| **Android SDK** | `API Level 36` (minSdk 24, compileSdk 36) | SDK Manager in Studio | Platform tools & build-tools 36.x |
| **Xcode** *(macOS only)* | `Xcode 15.0+` (Swift 5.9+) | `xcodebuild -version` | Required for iOS native build and simulator |

---

## 🚀 Step 1: Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/your-username/AnimaFind.git
cd AnimaFind

# Install verified dependencies reproducibly
npm install
```

---

## ⚙️ Step 2: Environment Configuration

Create your local `.env` file from the provided template:

```bash
cp .env.example .env
```

Review the values in `.env`:

```env
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional PostgreSQL database connection
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_db"
```

> **Note:** AnimaFind features a **dual-engine architecture**. By default, the application runs 100% offline and on-device using local IndexedDB storage. A PostgreSQL database is only required if you choose to run optional cloud backend API synchronization.

---

## 💻 Step 3: Running the Application Locally (Web & Dev Mode)

```bash
# Start the local development server with Turbopack
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

- You can simulate animal sightings using your webcam or the built-in **Specimen Simulator button (🎲)**.
- Hot-reload and instant refreshing are active.

---

## 🧪 Step 4: Quality Checks & Automated Testing

Always verify that type checking, linting, and automated unit tests pass before committing code:

```bash
# Run the complete test suite (Card math, Geo, Vision anti-cheat, Storage)
npm test

# Run TypeScript type validation
npm run typecheck

# Run ESLint rules
npm run lint
```

---

## 🤖 Step 5: Android Native Development

### 1. Set JAVA_HOME and ANDROID_HOME
Ensure your terminal environment variables point to JDK 21 and the Android SDK:

```bash
# Windows PowerShell example
$env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:PATH"

# macOS / Linux example
export JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home"
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"
```

### 2. Build Web Bundle & Sync to Android
```bash
npm run build:mobile
```

### 3. Open in Android Studio or Build from CLI
```bash
# Open Android Studio project
npm run cap:android

# Or build debug APK directly via command line
npm run android:debug

# Or build release APK
npm run android:release
```

Generated APKs are located at:
- **Debug:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release:** `android/app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 🍏 Step 6: iOS Native Development (macOS required)

1. Ensure Xcode 15+ is installed from the Mac App Store.
2. Build the web assets and synchronize with Capacitor:
   ```bash
   npm run build:mobile
   ```
3. Open the iOS project in Xcode:
   ```bash
   npm run cap:ios
   ```
4. Select an iOS Simulator (e.g. iPhone 15 Pro) from the target dropdown.
5. Press `Cmd + R` to build and run.

---

## ❓ Troubleshooting

- **"DATABASE_URL is required"**: The application uses a local fallback if unset, but ensure your `.env` contains `DATABASE_URL` if working on cloud API routes.
- **Gradle Daemon incompatible JVM**: Gradle 8.13 requires JDK 17 or JDK 21. Ensure `JAVA_HOME` points to JDK 21.
- **Camera access denied**: In browser development, access `http://localhost:3000` (camera APIs are restricted on unencrypted non-localhost origins).
