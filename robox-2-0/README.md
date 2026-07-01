# Robox 2.0

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

## Publishing games

New worlds begin as private drafts. Creators can publish a draft as a game in the shared Published Games list, then use Update Live to push later block changes. Deleting a world removes its draft and published copy permanently; deletion records prevent it from returning after the next login.

Friends can be added by typing their username and removed later with the confirmed Unfriend action. Account friends, avatar choices, coins, XP, and daily rewards are saved in the browser.

## iPhone and iPad

The interface supports phone and tablet portrait/landscape layouts, Apple safe areas, and touch gameplay controls. Touch players can move, jump, talk, enter Build mode, place blocks, and choose Erase to remove blocks.

## Maintenance mode

Set `maintenance: true` in `config.js` before publishing an in-progress update. Visitors will see a temporary-unavailable message while account and creation data remains untouched. Use `?maintenance=1` to preview that screen without changing the published setting.
