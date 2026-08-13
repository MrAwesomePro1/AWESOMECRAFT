# Robox

An original browser-based social and world platform prototype.

## Play

Open `index.html` in a modern browser, or serve this folder with any static web server.

New players begin signed out. Creating a local account includes a date-of-birth age check and confirmation; only the resulting age group is saved, not the birthday itself. Players can also sign into an account already saved on the device or continue as a guest without saving.

Multiple accounts can be saved on one device. Settings includes Switch Account, where players can move between profiles or add another account without mixing worlds, friends, avatars, rewards, or deletion history. Existing single-account saves migrate automatically.

Every new account begins at Day 1 of the daily streak with an empty friends list.

The original prebuilt experiences have been removed. Players can create their own named worlds, choose an environment, launch them, and save block edits to their account. In desktop Build mode, right-click places the selected block and left-click wrecks a block. The Expand control permanently grows a creator's platform by four tiles per side, up to 32 x 32.

Owned worlds are also kept in a separate per-account recovery library. Signing in merges the account copy, its recovery copy, and any published games owned by that username, while respecting confirmed deletions. Guest mode now tells players to sign in when saved worlds exist instead of incorrectly showing a clean slate.

World owners can open Invite Players on any creation, invite an exact username, and grant either play-only or build access. Permissions can be changed or removed later. Invited builders can place and wreck blocks in the published world; other visitors cannot enter Build mode.

The Updates tab provides a browsable release history. Players can choose an update directly or move through update notes with Previous and Next controls.

The home screen and in-game top bar both include a Controls button. Players can save Automatic, Keyboard & Mouse, or Touch Controls mode and change it during a paused game.

Update 7 adds a cache-busted version check. If an older copy is missing newer features, Robox shows Reload Latest and opens the canonical public build. The home screen also provides a downloadable offline ZIP package.

Update 8 adds a Pet Shop with four companions purchased using saved in-game R currency (Robux). Buying a pet deducts its price from that account only; no real-money payment is used. Equipped pets follow the player inside worlds. Press E while playing, or use the heart button on touch devices, to open the shop without losing the current world.

The home screen now includes a direct Switch Account button. Each saved account keeps its own Robux, pets, friends, worlds, avatar, and reward progress.

Update 9 adds a full Pet Designer page. Signed-in players can name a pet, choose a Pup, Kitty, Bot, or Dragon style, select body and accent colors, and preview the result live. Creating the custom pet costs R 1,000 in-game Robux, then saves and equips it to that account.

Update 10 adds the separate Robox Skin Maker app. Players can combine body, shirt, accent, pants, and hair colors with outfit, face, and hair layers; save up to 12 named skins; export a portable `.roboxskin` file; import that file on another device; download a PNG preview; and hand a finished skin into Robox for equipping. The original in-game Avatar Studio remains available. Uploading does not send credentials or assets to the official Roblox platform.

Update 11 adds a start-screen device chooser plus a Robux Store. Players can pick iPad/iPhone for touch controls or Computer for keyboard and mouse before entering Robox. The Buy Robux buttons open an in-game-only store with R 250, R 1,000, and R 5,000 bundles. Robux is added to the local Robox profile only; no real money, payment card, or official Roblox account is used.

Update 12 adds an honest Multiplayer Setup Needed screen with a sad face. Friends can still be saved, managed, and unfriended, but Play Together now explains that real player multiplayer needs a connected realtime server before live players can join. Robox does not fake real friends as NPCs.

Update 13 renames the visible app to Robox. Existing public links still work, but the boot screen, top bar, profile upload copy, downloadable package, and Awesome Development listing now use the shorter Robox name. Shared links can use `?version=13` to avoid old cached copies.

Update 14 adds Robux Machines and Kidtopia Money. Build mode includes a Robux Machine tool; owners and permitted builders can place machines in worlds, then players can press E near one to buy world boosts and items with Robux. The Robux Store now accepts any custom Robux amount and spends pretend Kidtopia Money to buy it. Shared links can use `?version=14` to avoid old cached copies.

Update 15 adds the Pro One Banking website connection. The Robux Store can connect Kidtopia Money to the public Pro One Banking website, open that banking page, and write transactions when Kidtopia Money is spent to buy Robux. Shared links can use `?version=15` to avoid old cached copies.

Update 16 removes the old 100,000 cap from custom amounts. Pro One Banking deposits now add the exact Kidtopia Money amount entered, and the Robux Store custom amount no longer has a fixed maximum. Shared links can use `?version=16` to avoid old cached copies.

Update 17 adds promo codes to the Robux Store. Enter code `2017` and press Apply to make Robux bundle and custom purchases cost K 0 Kidtopia Money for 100% off. Shared links can use `?version=17` to avoid old cached copies.

Update 18 adds an in-game SHOP button for iPad and iPhone touch controls. Touch players can open the pet shop without using a keyboard. Shared links can use `?version=18` to avoid old cached copies.

Update 19 adds a Shop Item Maker. Signed-in players can create custom items, choose a type, color, description, and Robux price, then put those things into the in-game shop for players on the same device to buy. Shared links can use `?version=19` to avoid old cached copies.

Update 20 adds public multiplayer rooms for published worlds. Players can create a new room, join the first open public room, or select a visible room code. Up to 12 players can share a room and see each other's live positions across devices. Shared links can use `?version=20` to avoid old cached copies.

Update 21 adds world files. Players can download a starter `.roboxworld` file, edit it as JSON, import it to create a saved draft world, and export any world they made as a reusable `.roboxworld` file. Shared links can use `?version=21` to avoid old cached copies.

Update 22 adds Brainrot Bases and the new main screen photo. Worlds with Brainrot in the name or description now spawn collectible brainrots, show YOUR BASE in-game, let players carry brainrots home, and reward stored brainrots with in-game Robux. Shared links can use `?version=22` to avoid old cached copies.

Update 23 adds the behind-the-player 3D obby view for Brainrot/base worlds and removes the old 32 x 32 expansion stop. The renderer now draws only the visible part of huge platforms, so creators can keep expanding their world size without a fixed maximum. Shared links can use `?version=23` to avoid old cached copies.

Update 24 adds mouse look to 3D Brainrot worlds. Click inside the game to lock the mouse, move the mouse to look around, press Esc to release it, and use WASD to move based on the direction you are looking. Touch players can drag on the game view to look around. Shared links can use `?version=24` to avoid old cached copies.

Update 25 adds the Robox Platform Guide. The new Platform page explains the online game hub, creation tools, Robux economy, popular genres, safety and moderation ideas, platform history notes, creator workflows, discovery, marketplace, social audio, trust, commerce, and future engine roadmap items. Shared links can use `?version=25` to avoid old cached copies.

Update 26 makes the public Robox app available offline after the first online visit. It adds a web app manifest, registers a service worker, and caches the app shell, styles, scripts, main screen image, world templates, version file, and Update 26 download package. Shared links can use `?version=26` to avoid old cached copies.

## Publishing games

New worlds begin as private drafts. Creators can publish a draft as a game in the shared Published Games list, then use Update Live to push later block changes. Deleting a world removes its draft and published copy permanently; deletion records prevent it from returning after the next login.

Friends can be added by typing their username and removed later with the confirmed Unfriend action. Account friends, avatar choices, coins, XP, and daily rewards are saved in the browser.

## iPhone and iPad

The interface supports phone and tablet portrait/landscape layouts, Apple safe areas, and touch gameplay controls. Touch players can move, jump, talk, enter Build mode, place blocks, and choose Erase to remove blocks.

## Maintenance mode

Set `maintenance: true` in `config.js` before publishing an in-progress update. Visitors will see a temporary-unavailable message while account and creation data remains untouched. Use `?maintenance=1` to preview that screen without changing the published setting.
