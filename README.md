# 🏁 Turbo Karts

A kart racer in the style of Mario Kart for **iPhone, iPad and Mac**, with **online races against friends**. It has no dependencies: a custom WebGL renderer, synthesized sound, and a small Node.js game server that uses only built-in modules.

## Features
- **Custom names** and 8 racer colours
- **Online multiplayer:** create a room, send the invite link, and race up to 8 people. CPU racers fill any empty spots.
- **Big, flowing tracks** with wide sweeping turns built for drifting
- **Obstacles:** wandering cows and hay bales (Meadow), tyre stacks and cones (Sunny), snowmen and slippery ice (Frosty), rolling boulders (Canyon), Crusher blocks and fire geysers (Lava), Crusher blocks and energy vents (Crystal). CPU racers steer around them too.
- **Trackside decoration:** arches over the road, flags, billboards, themed props, windmills, hot-air balloons, a blimp, penguins, lava falls and floating crystals
- **6 tracks at 3 difficulties:**
  - **Easy:** Meadow Loop and Sunny Circuit (wide, gentle turns)
  - **Medium:** Frosty Speedway and Canyon Twist
  - **Hard:** Lava Peak and Crystal Cliffs (narrow road, hairpins, squeeze sections, slow off-road)
- **3, 6 or 10 laps** (10 by default)
- **Mario Party-style mini-game every 3 laps.** A roulette picks one (never the same as the last two):
  - 🪙 **Coin Rush:** grab the most coins
  - 🎯 **Target Smash:** press ITEM to fire at targets
  - 🚦 **Quick Draw:** press ITEM or DRIFT the instant the light turns green
  - 💥 **Bumper Karts:** ram rivals off a shrinking platform into the lava (like *Bumper Balls*)
  - 🎨 **Color Chaos:** park on the called colour before every other tile drops (like *Hexagon Heat*)
  - 💣 **Hot Bomb:** bump someone to pass the bomb before it blows (like *Hot Bob-omb*)

  The winner becomes 👑 **Champion** until the next mini-game: +8% top speed and a free item.
- **Hold up to 2 items:** ⚡ Boost, 🍌 Banana, 🚀 Homing Rocket, ⭐ Star. Using an item fires the first one; the second then moves up.
- **Scoreboard:** 1 point per race win, saved by player name. In online games it's the room's scoreboard, and the host's device keeps it for the next session.
- **Drift mini-turbos in 3 tiers:** hold drift through a turn and release on 🔵 blue, 🟠 orange or 🟣 purple sparks (Ultra Turbo)
- Rocket starts, boost pads, minimap, name tags, and best times

## Controls
| | Mac keyboard | iPhone / iPad | Controller |
|---|---|---|---|
| Steer | ← → / A D | Thumb anywhere on the left half, slide left/right | Left stick / D-pad |
| Gas | ↑ / W | Automatic | A / R2 |
| Brake | ↓ / S | BRAKE | B / L2 |
| Drift | Space / Shift | DRIFT (hold) | L1 / R1 |
| Item | E / X | ITEM | X / Y |
| Pause | Esc / P | ❚❚ | Menu |

## Run it on your computer
You need [Node.js](https://nodejs.org) 18 or newer. There's nothing to install.
```bash
cd turbo-karts
npm start
# open http://localhost:8000
```
The server hosts both the game and online rooms.

- **Online on your own Wi-Fi:** other devices on the same network can join. Open `http://<your-computer's-IP>:8000` on them, or use the invite link, but only after changing `localhost` in it to your computer's IP.
- **Solo only:** you can serve the folder with any static web server instead, such as `python3 -m http.server`. Online play won't work that way.

## Put it online so friends anywhere can join (free, about 10 minutes)
Invite links only work for friends elsewhere if the server is on the internet. [Render](https://render.com) is one free option:

1. Push the `turbo-karts` folder to a GitHub repository.
2. On Render, choose **New → Web Service** and pick that repository.
3. Settings:
   - **Runtime:** Node
   - **Build command:** leave empty
   - **Start command:** `npm start`
   - **Instance type:** Free
   - **Root directory:** set this to `turbo-karts` if that folder isn't the repository root.
4. Open the `https://….onrender.com` address it gives you, tap **🌐 Race Online**, then **📨 Invite friends**.

A free Render server goes to sleep after a while without visitors, and the first visit afterwards takes about 30–60 seconds to wake it. Other Node hosts (Fly.io, Railway, a VPS) work the same way. The server reads its port from the `PORT` environment variable.

On iPhone/iPad, open the address in Safari and tap **Share → Add to Home Screen** to play full-screen.

**Game files and server on different hosts:** add `?server=https://your-server.example` to the game's URL. Invite links carry this setting over.

## Code layout
```
index.html, style.css      Menus, online lobby, HUD, touch controls
js/sim.js                  Tracks, physics, items, AI, laps, mini-games, network snapshots (runs in browser and server)
js/main.js                 Game flow, rendering loop, HUD, online client
js/world.js                3D models for karts, items, tracks and the mini-game arena
js/gl.js, js/math.js       Small WebGL renderer
js/input.js, js/audio.js   Keyboard/touch/controller input and synthesized sound
js/net.js                  WebSocket client
server/server.js           Game server: static files, WebSocket rooms, authoritative race loop, scoreboard
```

## How online play works
The server runs the real race: CPU racers, items, laps, mini-games and scoring. Each player's device drives its own kart, so steering has no lag, and sends the kart's position to the server 30 times a second. The server sends everyone the full race state 20 times a second. Reaction Duel times are measured on each player's own device, so a slow connection doesn't hurt your score.

To add a track, append an entry to `TRACKS` in `js/sim.js`: control points (an optional third number narrows the road there), a difficulty, and a colour theme.
