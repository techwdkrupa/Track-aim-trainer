# TRACK — Tracking Aim Trainer

A browser-based aim trainer focused on **tracking**: keep your reticle locked
on a moving target for as much of the session as possible. Built with React
+ Vite, rendered on a `<canvas>`, and driven by the Pointer Lock API for
proper raw-mouse tracking with adjustable sensitivity.

## How it works

- The **contact** (target) drifts around the scope on a smooth random walk,
  bouncing off the edges.
- Click the scope to engage pointer lock — your mouse now drives a reticle
  directly, multiplied by your sensitivity setting, just like an FPS.
- Every millisecond your reticle overlaps the contact counts toward your
  **score** and **accuracy**.
- Pressing `Esc` releases pointer lock and ends the run early (your session
  is still scored on the time elapsed).

## Settings

| Setting        | What it does                                   |
| -------------- | ----------------------------------------------- |
| Session length  | Total run time in seconds                       |
| Contact speed   | How fast the target moves                        |
| Contact size    | Radius of the target, in pixels                  |
| Sensitivity     | Mouse-movement multiplier while pointer-locked   |

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser. Pointer lock requires a
real browser window (not an embedded iframe) and a user click to engage.

## Build

```bash
npm run build
npm run preview
```

## Stack

- React 19 + Vite
- Canvas 2D for rendering
- Pointer Lock API for cursor tracking
- No external UI libraries — styling is hand-rolled CSS

## Project structure

```
src/
  App.jsx                 state machine: start → playing → results
  components/
    StartScreen.jsx/.css   session config + animated scope preview
    GameScreen.jsx/.css    the tracking game itself (canvas + pointer lock)
    ResultsScreen.jsx/.css score, accuracy, and a lock-time history strip
```

## Ideas for extending

- Add a leaderboard (local storage or a backend)
- Multiple target patterns (figure-8, sudden direction snaps, multi-target)
- Click-based "flick" mode alongside tracking mode
- Configurable target color/contrast for accessibility testing

## Author

Made by [@kruparb_](https://instagram.com/kruparb_)

