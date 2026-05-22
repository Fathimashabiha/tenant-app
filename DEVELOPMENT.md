# Tenant mobile app — development

## Daily (JS only)

```powershell
# Terminal 1 — API (port 5002)
cd c:\Users\hplap\spacezen\apps\sz-tenant-service
pnpm run dev

# Terminal 2 — Expo
cd c:\Users\hplap\spacezen\apps\sz-tenant-mobileapp
pnpm run dev
```

`.env` in this folder (physical device):

```env
EXPO_PUBLIC_API_HOST=YOUR_PC_WIFI_IP
```

---

## Real camera / microphone (development build)

Native modules need a **dev client** binary (not Expo Go alone).

### A) Local (phone/emulator connected)

```powershell
cd c:\Users\hplap\spacezen\apps\sz-tenant-mobileapp
pnpm run prebuild
pnpm run build:android:dev
```

Requires Android Studio + USB debugging or emulator.

### B) EAS cloud (no local Android SDK)

```powershell
cd c:\Users\hplap\spacezen\apps\sz-tenant-mobileapp
pnpm run build:android:eas
```

Install the APK from the Expo dashboard, then run `pnpm run dev` and open that app.

---

## Scripts

| Script | Purpose |
|--------|---------|
| `pnpm run dev` | Start Metro |
| `pnpm run prebuild` | Generate `android/` / `ios/` |
| `pnpm run prebuild:clean` | Regenerate native projects |
| `pnpm run build:android:dev` | Build + install dev client locally |
| `pnpm run build:android:eas` | Cloud development APK |

---

## Troubleshooting

- **Sandbox Mode** — Old dev client; rebuild with `build:android:dev` or EAS.
- **Gradle `peer not authenticated`** — Network/proxy; use EAS build or fix corporate SSL.
- **No Android device** — Start emulator in Android Studio or plug in phone with USB debugging.
