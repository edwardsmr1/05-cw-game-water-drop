# charity: water – Water Quest

Water Quest is a short browser game about collecting clean water and avoiding contaminated drops.

## How to play

- Choose Easy, Normal, or Hard before starting. The selected mode sets the timer, score goal, drop speed, spawn rate, obstacle chance, and milestones.
- Click or keyboard-activate clean drops for **+1 point**.
- Avoid contaminated drops; clicking one costs **2 points** (the score cannot go below zero).
- Reach the mode's goal before time runs out to win.
- Play again to retry the selected mode or choose another difficulty.

| Difficulty | Time | Goal | Drop interval | Fall duration | Contaminated drops |
|---|---:|---:|---:|---:|---:|
| Easy | 40 seconds | 15 points | 1,100 ms | 4.5 seconds | 15% |
| Normal | 30 seconds | 20 points | 900 ms | 3.5 seconds | 25% |
| Hard | 25 seconds | 25 points | 750 ms | 2.7 seconds | 35% |

Wins and losses display a randomly selected motivational message. LevelUps include synthesized sound effects, score milestone pop-ups, and a confetti celebration on wins. Sound effects use the browser's Web Audio API when supported.

## Branding and links

The page uses the supplied charity: water logo and brand colors, with responsive layout rules. The footer links to [charity: water](https://www.charitywater.org/) and its [donation page](https://www.charitywater.org/donate).

## Run locally

Open `index.html` in a modern browser. No build step is required.
