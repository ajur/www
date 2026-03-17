---
title: "Space Raid"
description: "Lospec Jam 2 entry. A retro River Raid reinterpretation with pseudo-3D pixel art, local co-op and gamepad support — all within strict 8-bit console constraints."
status: completed
startDate: 2024-05-31
lastUpdated: 2024-05-31
image: lospecjam2.png
url: https://ajur.pl/lospecjam2/
links:
  - https://github.com/ajur/lospecjam2
  - https://ajur.itch.io/space-raid
  - https://itch.io/jam/lospec-jam-2/rate/2743660
---

A small reinterpretation of the classic River Raid, built to fit the specs of an imaginary 8-bit home console. Fly through a scrolling corridor, shoot enemies, collect fuel, and try to survive as long as possible — solo or with a friend in local co-op.

## Project Context

Created for **Lospec Jam 2** (May 2024), a month-long game jam hosted by [Lospec](https://lospec.com/) — a community dedicated to low-spec art forms like pixel art and chiptune. Unlike most jams, Lospec Jam has no theme — instead, all entries must conform to the specs of a fictional retro console, the **LS16**:

* **Resolution:** 256×224 pixels
* **Palette:** 16 colors — [Console16](https://lospec.com/palette-list/console16) by adamPhoebe
* **Controls:** 8-button controller (D-pad, A/B, Start/Select)

I also opted into the optional constraints: **2-player support** and sprite/tile size limits (16×16px sprites, up to 64 on screen).

The game placed **#10 Overall**, **#9 in Artistry** and **#9 in Polish** out of 38 entries.

## How to Play

The game is web-based and supports keyboard, touch, and gamepad:
* **Movement:** The ship moves forward automatically. Use the D-pad (arrow keys / left stick) to steer left, right, and control speed.
* **Shoot:** Press A (Z / gamepad A) to fire. Be careful — you can destroy fuel pickups too!
* **Fuel:** Collect the blue energy pickups to keep flying. Running out of fuel ends the run.
* **Multiplayer:** A second player can join locally — but navigating tight corridors together is part of the challenge!

## Tech Stack

* **Language:** JavaScript (with a touch of TypeScript)
* **Engine/Libraries:** Makeshift game engine custom built on top of [Pixi.js](https://pixijs.com/), bundled with Vite.
* **Art:** All pixel art drawn in [Aseprite](https://www.aseprite.org/), with pseudo-3D sprite styling. [LDtk](https://ldtk.io/) level editor was (ab)used to export sprites and tileset data.
* **No AI:** All assets created by hand — the jam rules explicitly prohibited AI-generated content.
