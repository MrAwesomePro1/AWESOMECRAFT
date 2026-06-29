# AWESOMECRAFT Steam Publishing Guide

This folder is a Steam submission starter pack for AWESOMECRAFT.

AWESOMECRAFT also has an in-game Awesome Development price of 7 ADC. Steam itself still requires a real-money store price configured in Steamworks; ADC is handled by the bundled Awesome Development wallet after launch.

## What Is Ready

- `content/index.html` is the current bundled game build.
- `content/AWESOMECRAFT.cmd` launches the game through the player's default browser.
- `scripts/app_build_REPLACE_WITH_APPID.vdf` is the SteamPipe app build template.
- `scripts/depot_build_REPLACE_WITH_DEPOTID.vdf` uploads every file in `content`.
- `output` is where SteamPipe can write build logs and cache files.

## What You Must Do In Steamworks

1. Create or sign in to your Steamworks partner account at `https://partner.steamgames.com/steamdirect`.
2. Complete Valve's identity, tax, and banking paperwork.
3. Pay the Steam Direct fee for this app.
4. Create the AWESOMECRAFT app in Steamworks.
5. Copy your Steam AppID and DepotID.
6. Rename the VDF files:
   - `app_build_REPLACE_WITH_APPID.vdf` to `app_build_YOUR_APPID.vdf`
   - `depot_build_REPLACE_WITH_DEPOTID.vdf` to `depot_build_YOUR_DEPOTID.vdf`
7. Edit both VDF files and replace:
   - `REPLACE_WITH_APPID`
   - `REPLACE_WITH_DEPOTID`
8. In Steamworks, set the Windows launch option executable to:
   - `AWESOMECRAFT.cmd`
9. Upload the build with SteamCMD from the Steamworks SDK:

```powershell
steamcmd.exe +login YOUR_BUILD_ACCOUNT +run_app_build ..\scripts\app_build_YOUR_APPID.vdf +quit
```

10. Test the build on a private branch before making it public.

## Important Note

This starter pack launches the browser version of the game. For a stronger Steam release, the next upgrade should be a real desktop wrapper such as Electron, Tauri, or a WebView2 launcher that opens the game in its own app window.
