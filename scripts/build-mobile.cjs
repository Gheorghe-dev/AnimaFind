#!/usr/bin/env node
/**
 * Cross-platform static export and Capacitor synchronization pipeline.
 * Temporarily isolates server-only API routes during static generation,
 * then synchronizes compiled web bundles directly into Android and iOS native projects.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const apiDir = path.join(rootDir, "src", "app", "api");
const tempApiDir = path.join(rootDir, "src", "app", "_api_temp_backup");
const nextDir = path.join(rootDir, ".next");
const outDir = path.join(rootDir, "out");

console.log("==================================================");
console.log("🐾 AnimaFind Mobile Production Build & Sync");
console.log("==================================================");

function runCommand(bin, args, envVars) {
  if (process.platform === "win32") {
    const cmdLine = [bin, ...args].join(" ");
    return spawnSync("cmd.exe", ["/d", "/s", "/c", cmdLine], {
      cwd: rootDir,
      env: envVars,
      stdio: "inherit",
    });
  }
  return spawnSync(bin, args, {
    cwd: rootDir,
    env: envVars,
    stdio: "inherit",
  });
}

let apiMoved = false;

try {
  if (fs.existsSync(apiDir)) {
    console.log("📦 Stashing server API routes for clean static export...");
    if (fs.existsSync(tempApiDir)) {
      fs.rmSync(tempApiDir, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, tempApiDir);
    apiMoved = true;
  }

  // Clear stale Turbopack / Next validator cache if present
  if (fs.existsSync(nextDir)) {
    try {
      fs.rmSync(nextDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }

  console.log("🚀 Generating static site bundle with Next.js (output: export)...");
  const env = { ...process.env, OUTPUT_EXPORT: "true" };
  const buildResult = runCommand("npm", ["run", "build"], env);

  if (buildResult.status !== 0) {
    throw new Error(`Next.js build failed with exit code ${buildResult.status}`);
  }

  if (!fs.existsSync(outDir)) {
    throw new Error(`Expected output directory "${outDir}" was not generated!`);
  }

  console.log("✅ Static bundle created successfully in ./out");
  console.log("📲 Synchronizing assets and plugins with Capacitor (iOS & Android)...");

  const syncResult = runCommand("npx", ["cap", "sync"], process.env);

  if (syncResult.status !== 0) {
    throw new Error(`Capacitor sync failed with exit code ${syncResult.status}`);
  }

  console.log("==================================================");
  console.log("🎉 SUCCESS: Mobile build and synchronization complete!");
  console.log("   - Android native bundle updated in: ./android");
  console.log("   - iOS native bundle updated in: ./ios");
  console.log("   - Web app is 100% offline & production-ready.");
  console.log("==================================================");
} catch (err) {
  console.error("❌ Build error:", err.message);
  process.exitCode = 1;
} finally {
  if (apiMoved && fs.existsSync(tempApiDir)) {
    console.log("🔄 Restoring server API routes...");
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    fs.renameSync(tempApiDir, apiDir);
    console.log("✅ Server API routes restored.");
  }
}
