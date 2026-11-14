# STARX FLOW MOBILE — BUILD & COMPILATION GUIDE
**Document Reference:** `docs/mobile/BUILD_GUIDE.md`  
**Phase:** Phase 17 — Production Preparation  
**Target Environments:** Android & iOS  

---

## 1. System Requirements & Tooling

To build the StarX Flow cross-platform mobile application, the following toolchains are verified:

- **JDK:** OpenJDK 17 LTS (Java 17 is the verified baseline for AGP 8.5.2 and Kotlin 2.0.21).
- **Gradle:** Gradle 8.9 (included via Gradle Wrapper `mobile/gradlew`).
- **Android SDK:**
  - `compileSdk`: 35 (or 34)
  - `minSdk`: 26 (Android 8.0 Oreo+)
  - `targetSdk`: 35
  - Android Build Tools: 34.0.0 / 35.0.0
- **iOS & Xcode (macOS only):**
  - Xcode 15.0+
  - iOS Deployment Target: iOS 15.0+

---

## 2. Directory Structure

```
starx-flow/
├── mobile/
│   ├── composeApp/            # Compose Multiplatform UI & Application Shell
│   │   ├── build.gradle.kts
│   │   └── src/
│   │       ├── commonMain/    # Shared Composable Screens, Themes, ViewModels
│   │       ├── androidMain/   # Android Activity, Manifest, Platform Config
│   │       └── iosMain/       # iOS ComposeUIViewController entry point
│   ├── shared/                # Shared Business Logic, Data & Domain Layer
│   │   ├── build.gradle.kts
│   │   └── src/
│   │       ├── commonMain/    # Core Models, Ktor Client, SQLDelight DB, Repositories
│   │       ├── androidMain/   # Android DriverFactory & SecureStorage
│   │       └── iosMain/       # iOS Native DriverFactory & Keychain SecureStorage
│   ├── iosApp/                # Native iOS Xcode Project & SwiftUI Shell
│   ├── gradle/
│   │   ├── libs.versions.toml # Centralized Version Catalog
│   │   └── wrapper/           # Gradle 8.9 Wrapper
│   ├── build.gradle.kts       # Root Mobile Gradle Config
│   ├── settings.gradle.kts    # Project Module Definitions
│   ├── gradlew & gradlew.bat
│   └── local.properties       # Local Android SDK Directory Pointer
```

---

## 3. Step-by-Step Build Instructions

### 3.1 Android Build

1. Open a terminal and navigate to `mobile/`:
   ```bash
   cd mobile
   ```

2. Verify your `local.properties` contains your Android SDK location:
   ```properties
   sdk.dir=C:/Users/<username>/AppData/Local/Android/Sdk
   ```

3. Ensure `JAVA_HOME` points to JDK 17:
   ```bash
   # Windows PowerShell
   $env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot\"
   ```

4. Assemble the Debug APK:
   ```bash
   ./gradlew :composeApp:assembleDebug
   ```
   Output artifact: `mobile/composeApp/build/outputs/apk/debug/composeApp-debug.apk`.

5. Assemble the Release Production Bundle (AAB for Google Play):
   ```bash
   ./gradlew :composeApp:bundleRelease
   ```
   Output artifact: `mobile/composeApp/build/outputs/bundle/release/composeApp-release.aab`.

---

### 3.2 iOS Build (macOS / Xcode Environment)

1. Generate the shared Kotlin framework:
   ```bash
   cd mobile
   ./gradlew :composeApp:embedAndSignAppleFrameworkForXcode
   ```

2. Open the Xcode project:
   ```bash
   open iosApp/iosApp.xcodeproj
   ```

3. Select your target simulator (e.g. iPhone 15 Pro) or physical device and press **Run (⌘R)**.

4. To archive for Apple TestFlight / App Store:
   - Select **Product > Archive**.
   - Follow standard Apple Organizer distribution flow.

---

## 4. ProGuard & R8 Configuration

Production release builds utilize R8 code shrinking and optimization. The rules are pre-configured in `mobile/composeApp/proguard-rules.pro`:

```proguard
# Kotlinx Serialization
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# SQLDelight
-keep class com.starxflow.shared.database.** { *; }

# Ktor & Netty/OkHttp
-dontwarn io.ktor.**
```
