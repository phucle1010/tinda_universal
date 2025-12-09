# Hướng dẫn thiết lập Universal Links

Dự án này đã được cấu hình để hỗ trợ Deep Universal Links cho iOS và Android. Khi người dùng click vào link từ project Share link khác, website sẽ tự động phát hiện và mở app nếu đã cài đặt, hoặc chuyển đến App Store/Google Play nếu chưa cài.

## Cấu trúc

- `app/config.ts` - File cấu hình chính, cần cập nhật thông tin app của bạn
- `app/[path]/page.tsx` - Trang xử lý universal link, tự động phát hiện OS và redirect
- `app/api/apple-app-site-association/route.ts` - API route cho iOS Universal Links
- `app/api/assetlinks/route.ts` - API route cho Android App Links
- `next.config.ts` - Cấu hình rewrite và headers cho `.well-known` files

## Các bước thiết lập

### 1. Cập nhật cấu hình trong `app/config.ts`

Mở file `app/config.ts` và cập nhật các thông tin sau:

```typescript
export const APP_CONFIG = {
  iosAppStoreId: '123456789', // App Store ID của bạn
  iosBundleId: 'com.tinda.app', // Bundle ID iOS
  androidPackageName: 'com.tinda.app', // Package name Android
  androidPlayStoreUrl: 'https://play.google.com/store/apps/details?id=com.tinda.app',
  universalLinkScheme: 'https://tinda.app', // Domain của bạn (phải match với domain website)
  websiteDomain: 'https://tinda.app', // Domain website
};
```

### 2. Cấu hình iOS Universal Links

#### 2.1. Cập nhật Team ID

Mở file `app/api/apple-app-site-association/route.ts` và thay `TEAM_ID` bằng Team ID thực tế của bạn:

```typescript
appID: `ABC123XYZ.com.tinda.app`, // Thay ABC123XYZ bằng Team ID của bạn
```

Team ID có thể tìm thấy trong [Apple Developer Account](https://developer.apple.com/account/).

#### 2.2. Cấu hình trong Xcode

1. Mở project iOS trong Xcode
2. Chọn target app → **Signing & Capabilities**
3. Thêm **Associated Domains** capability
4. Thêm domain: `applinks:tinda.app` (thay bằng domain của bạn)
5. Đảm bảo domain này match với `universalLinkScheme` trong config

#### 2.3. Xử lý Universal Links trong app iOS

Trong app iOS, bạn cần xử lý universal links trong `AppDelegate` (Swift) hoặc `SceneDelegate`:

**Swift (AppDelegate):**
```swift
func application(_ application: UIApplication, 
                 continue userActivity: NSUserActivity, 
                 restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    guard userActivity.activityType == NSUserActivityTypeBrowsingWeb,
          let url = userActivity.webpageURL else {
        return false
    }
    
    // Xử lý URL ở đây
    handleUniversalLink(url: url)
    return true
}
```

### 3. Cấu hình Android App Links

#### 3.1. Lấy SHA-256 Fingerprint

Bạn cần lấy SHA-256 fingerprint của signing certificate:

**Debug keystore:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Release keystore:**
```bash
keytool -list -v -keystore path/to/your/release.keystore -alias your-alias
```

#### 3.2. Cập nhật Fingerprints

Mở file `app/api/assetlinks/route.ts` và thay thế các fingerprints:

```typescript
sha256_cert_fingerprints: [
  'AA:BB:CC:DD:EE:FF:...', // Debug fingerprint
  '11:22:33:44:55:66:...', // Release fingerprint
],
```

**Lưu ý:** Bỏ dấu `:` và chuyển thành uppercase khi paste vào code.

#### 3.3. Cấu hình trong AndroidManifest.xml

Thêm intent filter vào Activity chính trong `AndroidManifest.xml`:

```xml
<activity
    android:name=".MainActivity"
    android:exported="true">
    
    <!-- Existing intent filters -->
    
    <!-- App Links -->
    <intent-filter android:autoVerify="true">
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        
        <data
            android:scheme="https"
            android:host="tinda.app" />
    </intent-filter>
</activity>
```

#### 3.4. Xử lý App Links trong app Android

Trong Activity, xử lý intent:

```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Xử lý deep link
    intent?.data?.let { uri ->
        handleDeepLink(uri)
    }
}
```

### 4. Kiểm tra Universal Links

#### iOS:
1. Deploy website lên production (HTTPS bắt buộc)
2. Kiểm tra file: `https://yourdomain.com/.well-known/apple-app-site-association`
3. File phải trả về JSON với status 200, không redirect
4. Test trên thiết bị iOS thật (không hoạt động trên simulator)

#### Android:
1. Deploy website lên production (HTTPS bắt buộc)
2. Kiểm tra file: `https://yourdomain.com/.well-known/assetlinks.json`
3. Verify bằng lệnh:
```bash
adb shell pm verify-app-links --re-verify com.tinda.app
```

### 5. Sử dụng trong project Share link

Trong project Share link của bạn, khi tạo link, sử dụng format:

```
https://yourdomain.com/share/123?param=value
```

Khi người dùng click vào link này:
- Nếu app đã cài → Mở app với deep link
- Nếu app chưa cài → Chuyển đến App Store/Google Play

## Lưu ý quan trọng

1. **HTTPS bắt buộc:** Universal Links chỉ hoạt động với HTTPS, không hoạt động trên localhost hoặc HTTP
2. **Domain verification:** Domain trong config phải match với domain thực tế của website
3. **File format:** `.well-known` files phải được serve với đúng content-type và không có redirect
4. **Testing:** Universal Links không hoạt động trên simulator/emulator, cần test trên thiết bị thật
5. **Caching:** iOS và Android cache các file `.well-known`, có thể mất vài giờ để update

## Troubleshooting

### iOS không mở app:
- Kiểm tra Team ID đã đúng chưa
- Kiểm tra Associated Domains đã thêm trong Xcode chưa
- Xóa app và cài lại (để iOS re-verify domain)
- Kiểm tra file `.well-known/apple-app-site-association` có accessible không

### Android không mở app:
- Kiểm tra SHA-256 fingerprints đã đúng chưa
- Kiểm tra `android:autoVerify="true"` trong manifest
- Verify bằng adb command
- Xóa app và cài lại

## Tài liệu tham khảo

- [Apple Universal Links](https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app)
- [Android App Links](https://developer.android.com/training/app-links)
- [Next.js Rewrites](https://nextjs.org/docs/app/api-reference/next-config-js/rewrites)

