import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Build & Platform Configuration Integrity', async (t) => {
  const rootDir = process.cwd();

  await t.test('android/gradle.properties must not contain hardcoded java.home', () => {
    const gradleProps = fs.readFileSync(path.join(rootDir, 'android/gradle.properties'), 'utf-8');
    assert.strictEqual(
      gradleProps.includes('org.gradle.java.home='),
      false,
      'gradle.properties must not hardcode org.gradle.java.home so CI and multi-developer environments resolve JAVA_HOME dynamically'
    );
  });

  await t.test('android/app/build.gradle safely handles empty ANDROID_KEYSTORE_PATH without crashing', () => {
    const buildGradle = fs.readFileSync(path.join(rootDir, 'android/app/build.gradle'), 'utf-8');
    assert.strictEqual(
      buildGradle.includes('!keystorePath.trim().isEmpty()'),
      true,
      'build.gradle must verify that keystorePath is non-empty before calling file()'
    );
  });

  await t.test('android/gradlew.bat contains Windows JBR fallback for developer convenience', () => {
    const gradlewBat = fs.readFileSync(path.join(rootDir, 'android/gradlew.bat'), 'utf-8');
    assert.strictEqual(
      gradlewBat.includes('Android Studio\\jbr'),
      true,
      'gradlew.bat should dynamically locate Android Studio JBR when JAVA_HOME is not set'
    );
  });

  await t.test('Package identifiers and application IDs match across capacitor, android, and ios', () => {
    const capacitorConfig = fs.readFileSync(path.join(rootDir, 'capacitor.config.ts'), 'utf-8');
    const androidGradle = fs.readFileSync(path.join(rootDir, 'android/app/build.gradle'), 'utf-8');
    const pbxproj = fs.readFileSync(path.join(rootDir, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf-8');
    const infoPlist = fs.readFileSync(path.join(rootDir, 'ios/App/App/Info.plist'), 'utf-8');

    assert.strictEqual(capacitorConfig.includes('appId: "com.animafind.app"'), true);
    assert.strictEqual(androidGradle.includes('applicationId "com.animafind.app"'), true);
    assert.strictEqual(pbxproj.includes('PRODUCT_BUNDLE_IDENTIFIER = com.animafind.app;'), true);
    assert.strictEqual(infoPlist.includes('<string>AnimaFind</string>'), true);
  });

  await t.test('Version numbers and build codes match across Android and iOS targets', () => {
    const androidGradle = fs.readFileSync(path.join(rootDir, 'android/app/build.gradle'), 'utf-8');
    const pbxproj = fs.readFileSync(path.join(rootDir, 'ios/App/App.xcodeproj/project.pbxproj'), 'utf-8');

    // Android: versionCode 1, versionName "1.0"
    assert.strictEqual(androidGradle.includes('versionCode 1'), true);
    assert.strictEqual(androidGradle.includes('versionName "1.0"'), true);

    // iOS: CURRENT_PROJECT_VERSION = 1, MARKETING_VERSION = 1.0
    assert.strictEqual(pbxproj.includes('CURRENT_PROJECT_VERSION = 1;'), true);
    assert.strictEqual(pbxproj.includes('MARKETING_VERSION = 1.0;'), true);
  });

  await t.test('Required hardware permissions and usage descriptions are declared', () => {
    const manifest = fs.readFileSync(path.join(rootDir, 'android/app/src/main/AndroidManifest.xml'), 'utf-8');
    const infoPlist = fs.readFileSync(path.join(rootDir, 'ios/App/App/Info.plist'), 'utf-8');

    // Android permissions
    assert.strictEqual(manifest.includes('android.permission.CAMERA'), true);
    assert.strictEqual(manifest.includes('android.permission.ACCESS_FINE_LOCATION'), true);

    // iOS usage descriptions
    assert.strictEqual(infoPlist.includes('NSCameraUsageDescription'), true);
    assert.strictEqual(infoPlist.includes('NSLocationWhenInUseUsageDescription'), true);
    assert.strictEqual(infoPlist.includes('NSPhotoLibraryAddUsageDescription'), true);
  });
});
