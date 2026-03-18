---
title: "Nums v2"
description: "A second remake of Nums — a two-player strategy game on an irregular grid."
status: "in development"
startDate: 2025-11-01
image: nums-v2.png
url: https://ajur.pl/vibed_nums/
links:
  - https://github.com/ajur/vibed_nums
---

A new version of Nums, started as a proof of concept for vibecoding. I started with Google AI Studio, and the effects were pretty solid (at least for my low expectations with it).

## Game Rules

A two-player sequential strategy game played on an irregular grid. Players take turns picking numbers to maximize their score, but every move constrains the opponent's next move to a specific row or column.

1. **Objective:** Have the highest score when the game ends.
2. **Movement:** If Player A picks a cell in a row, Player B must pick a cell in that column (and vice versa). You cannot jump over voids (holes in the board).
3. **Game Over:** The game ends when a player is constrained to a line with no valid moves.

## Tech Stack

- Google AI Studio (at fist)
- React 18 + TypeScript
- Tailwind CSS
- Vite
