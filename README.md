
# 🐧 PenguinBet | Premium Arctic Social Arcade

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![UX](https://img.shields.io/badge/UX-Premium_Frost-blue)](https://penguinbet.io)

**PenguinBet** is a high-fidelity, arctic-themed social gaming platform. It combines sleek "Frost Glass" aesthetics with complex mathematical simulations to deliver a professional-grade arcade experience. Built for performance and visual impact, it features custom physics engines, strategic AI, and high-octane animations.

---

## ❄️ The Gaming Floor

PenguinBet offers a diverse suite of 10+ custom-built games, each engineered with specific mathematical models:

### 🚀 High-Velocity Action
*   **Penguin Slide (Crash):** A 1xbet-style exponential growth game. Features a parabolic flight curve ($e^{rt}$ formula) with real-time profit tracking and auto-cashout logic.
*   **Icy Roulette:** A high-speed vortex wheel with advanced easing functions and history tracking.
*   **Arctic Wheel:** A vertical spinning wheel with weighted sector probabilities and jackpot triggers.

### 🧠 Strategy & Skill
*   **Grandmaster Duel (Chess):** A full-featured chess engine integrated with a **Minimax AI** utilizing **Alpha-Beta pruning**. Supports PvE and local PvP modes.
*   **Frost Volley (Ping Pong):** A physics-based skill game featuring collision detection, variable velocity, and spin mechanics.
*   **Ice Mines:** A high-stakes grid game. Includes dynamic multiplier calculations based on risk (mine count) and successful extractions.

### 🎲 Instant Win & Classics
*   **Plinko:** A 12-row gravity simulation with custom particle physics and collision detection for an authentic "falling" feel.
*   **Shell Game:** A fast-paced "find the crystal" game with procedural shuffling and randomized positioning.
*   **Ice Tower:** A vertical ascension game with increasing multipliers and risk-managed level progression.
*   **Snow Dice:** A precision slider-based dice game with real-time "Roll Over/Under" odds calculation and win-chance visualization.

---

## 🛠 Technical Stack

-   **Frontend:** [React 19](https://react.dev/) with Functional Components and Hooks (`useCallback`, `useMemo`, `useRef`).
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a highly responsive, utility-first design system.
-   **Icons:** [Lucide React](https://lucide.dev/) for consistent, lightweight iconography.
-   **Animations:** Custom CSS keyframes combined with `requestAnimationFrame` for 60FPS physics simulations.
-   **Math Engines:** Custom implementations of exponential growth, probability weighting, and recursive AI algorithms.

---

## 🎨 UI/UX Philosophy: "Frost Glass"

PenguinBet utilizes a custom design language inspired by modern glassmorphism and arctic environments:
*   **Frost Glass:** High-blur backdrops with subtle white borders for a premium "icy" feel.
*   **Neon Accents:** Strategically placed glows (Pink, Blue, Emerald) to guide user attention.
*   **Responsive Layout:** A hybrid sidebar/header system that scales seamlessly from ultra-wide monitors to mobile devices.
*   **Haptic Feedback:** Visual "shaking" animations and glow pulses to reinforce wins and losses.

---

## 🚀 Getting Started

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18+)
-   [NPM](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/penguin-bet.git
   ```
2. Navigate to the project directory:
   ```bash
   cd penguin-bet
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
src/
├── components/       # Layout and global UI elements
├── games/            # Individual game logic and components
│   ├── Crash.tsx     # Exponential growth engine
│   ├── Chess.tsx     # Minimax AI & Chess logic
│   └── Plinko.tsx    # Gravity & Particle simulation
├── types.ts          # Global TypeScript interfaces
├── App.tsx           # Main application router and state
└── index.html        # Entry point and meta-configuration
```

---

## ⚖️ Disclaimer

**PenguinBet is a social arcade simulation.** 
*   All currency (Icy Credits) is virtual and has no real-world value.
*   This platform is for entertainment purposes only.
*   The code is intended as a showcase of frontend engineering and UI/UX design.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❄️ and React by the Arctic Team
</p>
