#!/bin/bash
set -e

echo "=== Building SmartCalc AI Android APK ==="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKDIR="/tmp/android-apk-build"
rm -rf "$WORKDIR"
mkdir -p "$WORKDIR"/src/com/smartcalc/ai
mkdir -p "$WORKDIR"/res/drawable-mdpi
mkdir -p "$WORKDIR"/res/drawable-hdpi
mkdir -p "$WORKDIR"/res/drawable-xhdpi
mkdir -p "$WORKDIR"/res/drawable-xxhdpi
mkdir -p "$WORKDIR"/res/values
mkdir -p "$WORKDIR"/assets/www
mkdir -p "$WORKDIR"/bin
mkdir -p "$WORKDIR"/keystore

ANDROID_JAR="/usr/lib/android-sdk/platforms/android-23/android.jar"
if [ ! -f "$ANDROID_JAR" ]; then
  echo "Error: android.jar not found at $ANDROID_JAR"
  exit 1
fi

# Step 1: Ensure dist/ is built
echo "Step 1: Building production web assets..."
cd "$ROOT_DIR"
npm run build

echo "Copying web assets to APK assets/www directory..."
cp -r "$ROOT_DIR"/dist/* "$WORKDIR"/assets/www/
rm -rf "$WORKDIR"/assets/www/*.apk "$WORKDIR"/assets/www/downloads 2>/dev/null || true

# Step 2: Prepare app icons
echo "Step 2: Preparing icons..."
if [ -f "$ROOT_DIR/assets/icon.png" ]; then
  cp "$ROOT_DIR"/assets/icon.png "$WORKDIR"/res/drawable-mdpi/ic_launcher.png
  cp "$ROOT_DIR"/assets/icon.png "$WORKDIR"/res/drawable-hdpi/ic_launcher.png
  cp "$ROOT_DIR"/assets/icon.png "$WORKDIR"/res/drawable-xhdpi/ic_launcher.png
  cp "$ROOT_DIR"/assets/icon.png "$WORKDIR"/res/drawable-xxhdpi/ic_launcher.png
fi

# Step 3: Write AndroidManifest.xml
echo "Step 3: Writing AndroidManifest.xml..."
cat << 'EOF' > "$WORKDIR"/AndroidManifest.xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.smartcalc.ai"
    android:versionCode="100"
    android:versionName="1.0.0">

    <uses-sdk
        android:minSdkVersion="21"
        android:targetSdkVersion="33" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@drawable/ic_launcher"
        android:label="@string/app_name"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@android:style/Theme.NoTitleBar">
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout"
            android:hardwareAccelerated="true"
            android:windowSoftInputMode="adjustResize"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
EOF

# Step 4: Write strings.xml
cat << 'EOF' > "$WORKDIR"/res/values/strings.xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">SmartCalc AI</string>
</resources>
EOF

# Step 5: Write Java code for MainActivity
echo "Step 5: Writing MainActivity.java..."
cat << 'EOF' > "$WORKDIR"/src/com/smartcalc/ai/MainActivity.java
package com.smartcalc.ai;

import android.app.Activity;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
    private WebView mWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        
        mWebView = new WebView(this);
        mWebView.setBackgroundColor(0xFF070F26);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUserAgentString(settings.getUserAgentString() + " SmartCalcAI-App/1.0");

        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

        mWebView.setWebChromeClient(new WebChromeClient());
        mWebView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
EOF

# Step 6: Generate R.java with AAPT
echo "Step 6: Compiling resources with aapt..."
aapt package -f -m \
  -J "$WORKDIR"/src \
  -M "$WORKDIR"/AndroidManifest.xml \
  -S "$WORKDIR"/res \
  -I "$ANDROID_JAR"

# Step 7: Compile Java sources
echo "Step 7: Compiling Java source with javac..."
javac -source 1.8 -target 1.8 \
  -bootclasspath "$ANDROID_JAR" \
  -d "$WORKDIR"/bin \
  "$WORKDIR"/src/com/smartcalc/ai/*.java

# Step 8: Convert bytecode to classes.dex
echo "Step 8: Converting to classes.dex with dalvik-exchange..."
/usr/bin/dalvik-exchange --dex --output="$WORKDIR"/bin/classes.dex "$WORKDIR"/bin

# Step 9: Package resources, manifest, and assets into initial APK
echo "Step 9: Packaging APK with aapt..."
aapt package -f \
  -M "$WORKDIR"/AndroidManifest.xml \
  -S "$WORKDIR"/res \
  -A "$WORKDIR"/assets \
  -I "$ANDROID_JAR" \
  -F "$WORKDIR"/bin/unaligned.apk

# Step 10: Add classes.dex into APK
echo "Step 10: Adding classes.dex to APK..."
cd "$WORKDIR"/bin
aapt add unaligned.apk classes.dex

# Step 11: Zipalign APK
echo "Step 11: Aligning APK with zipalign..."
zipalign -v -p 4 unaligned.apk aligned.apk

# Step 12: Generate keystore if not exists
KEYSTORE="$WORKDIR"/keystore/release.keystore
if [ ! -f "$KEYSTORE" ]; then
  echo "Step 12: Generating signing key with keytool..."
  keytool -genkeypair -v \
    -keystore "$KEYSTORE" \
    -alias smartcalc \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass smartcalc123 \
    -keypass smartcalc123 \
    -dname "CN=SmartCalc AI, OU=Engineering, O=SmartCalc, L=Mountain View, ST=CA, C=US"
fi

# Step 13: Sign APK with apksigner
echo "Step 13: Signing APK with apksigner..."
apksigner sign \
  --ks "$KEYSTORE" \
  --ks-pass pass:smartcalc123 \
  --ks-key-alias smartcalc \
  --key-pass pass:smartcalc123 \
  --out "$WORKDIR"/smartcalc-ai.apk \
  aligned.apk

# Step 14: Verify APK
echo "Step 14: Verifying signed APK..."
apksigner verify --verbose "$WORKDIR"/smartcalc-ai.apk

# Step 15: Publish to public directory for downloads
echo "Step 15: Publishing APK to public directory..."
mkdir -p "$ROOT_DIR"/public/downloads
cp "$WORKDIR"/smartcalc-ai.apk "$ROOT_DIR"/public/smartcalc-ai.apk
cp "$WORKDIR"/smartcalc-ai.apk "$ROOT_DIR"/public/downloads/smartcalc-ai.apk

APK_SIZE=$(ls -lh "$ROOT_DIR"/public/smartcalc-ai.apk | awk '{print $5}')
APK_SHA=$(sha256sum "$ROOT_DIR"/public/smartcalc-ai.apk | awk '{print $1}')

echo "============================================="
echo "✅ Android APK created successfully!"
echo "Location: $ROOT_DIR/public/smartcalc-ai.apk"
echo "Download URL: /smartcalc-ai.apk"
echo "File Size: $APK_SIZE"
echo "SHA-256: $APK_SHA"
echo "============================================="
