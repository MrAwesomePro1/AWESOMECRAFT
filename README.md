# AWESOMECRAFT

AWESOMECRAFT is an original browser-based sandbox prototype inspired by block-building survival games. It includes:

- multiplayer realm syncing across browser tabs through local storage plus `BroadcastChannel`
- touch-friendly controls for iPad and desktop keyboard controls
- a startup world menu with `New World` and `Load World`
- named worlds with save slots you can reload later
- single-player or multiplayer world starts
- creative or survival world creation
- a player maker with skin tone, shirt, hair, and gear choices
- a hidden `Secret World` start that switches straight into creative mode
- mods, add-ons, mash-ups, and texture packs
- a full inventory screen with a `3x3` crafting grid
- a day and night cycle with monsters spawning after dark
- a larger overworld plus Nether and End dimensions connected by portals
- a Giga Slime miniboss in the overworld and an Ender Dragon final boss in the End
- friend-only voice chat and built-in recording where the browser supports them
- computer blocks with a built-in BuildTube app
- a pause menu on `P`

## Run it

Open [index.html](./index.html) in a browser, or serve the folder with any static web server.

Keyboard controls:

- `WASD` or arrow keys: move in Classic view
- First Person mode: `W/S` walk, `A/D` or left/right arrows turn, drag on the play screen to look around
- `Q`: break block
- `R`: place selected block
- `Space`: attack
- `E`: open inventory and crafting
- `F`: use portals and computers
- `V`: toggle Classic view and First Person mode
- `P`: pause menu

## Install On Home Screen

The GitHub Pages build now includes a web app manifest, install button, icons, and an offline cache.

- On iPad Safari: open the site, tap `Share`, then choose `Add to Home Screen`
- On desktop browsers that support install prompts: use the `Add to Home Screen` button or the browser install button

## GitHub Pages

This project can be published directly with GitHub Pages from the repository root. The `.nojekyll` file is included so the static files deploy without a Jekyll build step.

Touch controls are shown on screen automatically.

To jump into the hidden creative realm, use the `Secret World` button on the `New World` screen. It starts a saved world slot named `Secret World`, so it also shows up later under `Load World`.

Use the `Make Your Player` area in the Player panel to customize your builder. Your look is saved with each world.

Use the `Turn On First Person` button or press `V` any time in-game to switch between the overhead Classic view and the turnable first-person play mode.

## Steam Release Prep

The `steam-release` folder contains a Steam submission starter pack with the latest bundled game, a Windows launch script, SteamPipe VDF templates, and a store-page draft. You still need a Steamworks partner account, an AppID, a DepotID, and Valve review before it can go public on Steam.
