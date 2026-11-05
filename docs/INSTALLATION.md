# 🚀 AnimaFind Step-by-Step Installation Tutorial

This tutorial walks you through setting up **AnimaFind (Critter Codex)** from a clean environment to a fully operational local web build and native mobile compilation (Android & iOS).

---

## 1. Prerequisites

Before beginning installation, ensure your workstation satisfies the following requirements:

### Required Software
| Component | Minimum Version | Recommended Version | Verification Command | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Node.js** | `v20.0.0` | `v22.x LTS` or `v24.x` | `node -v` | Application runtime & build tooling |
| **npm** | `v10.0.0` | `v11.x` | `npm -v` | Dependency package management |
| **Java JDK** | `JDK 21 LTS` | Eclipse Temurin / OpenJDK 21 | `java -version` | Android Gradle Plugin 8.13 |
| **Android Studio** | Ladybug (2024.2+) | Latest Stable | Studio UI | Android SDK & emulator management |
| **Android SDK** | API Level 36 | API 36, Build-Tools 36.x | Android Studio SDK Manager | Native Android compilation |
| **Xcode** *(macOS only)* | `15.0+` | Latest Xcode with Swift 5.9 | `xcodebuild -version` | iOS native compilation & simulator |

---

## 2. Cloning the Repository

```bash
# Clone the repository
git clone https://github.com/Gheorghe-dev/AnimaFind.git

# Enter project directory
cd AnimaFind
```

---

## 3. Dependency Installation

Install all verified production and development dependencies:

```bash
npm install
```

> **Verification:** Running `npm list --depth=0` should report all packages cleanly without missing peer dependencies.

---

## 4. Environment Configuration

AnimaFind uses an environment template to keep sensitive keys and local database connections decoupled from source code.

```bash
# Copy the environment template
cp .env.example .env
```

Open `.env` in your text editor and inspect the defaults:

```env
# Node Environment
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Cloud Database (PostgreSQL with Drizzle ORM)
# Default standalone mobile and web modes operate 100% offline via local IndexedDB.
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/app_db"

# Mobile static export flag (automatically handled by build:mobile script)
OUTPUT_EXPORT="false"
```

> 🔒 **Security Notice:** The `.env` file is excluded from Git tracking via `.gitignore`. Never commit credentials or keystores to GitHub.

---

## 5. First Run & Development Server

Launch the Next.js development server with Turbopack:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

### What You Should See:
1. The **Naturalist Onboarding Flow** opens, presenting the 3-step privacy charter and username selection.
2. Complete onboarding (or browse the SaaS product tour at `/landing`).
3. You will arrive at the **Field Scan** screen. You can either allow webcam access or tap the **🎲 Specimen Simulator button** to generate test wildlife specimens.

---

## 6. Verification Step: Confirming Setup Works

To verify that your installation is 100% functional, execute the three core validation scripts:

```bash
# Step 1: Run the automated unit test suite (23 tests across 5 suites)
npm test

# Expected Output:
# ▶ Card Generation & Math Engine ... ✔ (pass)
# ▶ Store Catalog & Economy Engine ... ✔ (pass)
# ▶ Geospatial & Coordinate Fuzzing Engine ... ✔ (pass)
# ▶ Local-First Storage & Offline Game Engine ... ✔ (pass)
# ▶ Computer Vision & Anti-Cheat Heuristics ... ✔ (pass)
# ℹ tests 23 | pass 23 | fail 0

# Step 2: Validate TypeScript types
npm run typecheck

# Expected Output:
# Exit code 0 (no errors)

# Step 3: Run ESLint static analysis
npm run lint

# Expected Output:
# Exit code 0 (no errors)
```

---

## 7. Compiling Native Mobile Builds

### Step 7.1: Build Web Bundle & Synchronize Capacitor
```bash
npm run build:mobile
```
This generates the static bundle in `./out` and synchronizes web assets and plugins directly into `./android` and `./ios`.

### Step 7.2: Android Compilation
Ensure `JAVA_HOME` points to your JDK 21 installation:
```bash
# On Windows PowerShell
$env:JAVA_HOME = "C:\Program Files\Android\openjdk\jdk-21.0.8"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Build Debug APK
npm run android:debug

# Build Production Release APK
npm run android:release
```
APKs will be generated at:
- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Step 7.3: iOS Compilation (macOS)
```bash
# Open in Xcode
npm run cap:ios
```
From Xcode, select an iOS Simulator (e.g. iPhone 15 Pro) and press `Cmd + R` to run.
