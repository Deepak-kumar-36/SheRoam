# SheRoam · Safety as a State of Mind

![SheRoam Banner](https://img.shields.io/badge/Design_System-Spade-ceee93?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/Frontend-React_19-61dafb?style=for-the-badge&logo=react)

**SheRoam** is a premium, high-tech women's safety platform designed with a focus on editorial typography, glassmorphism, and real-time backend integration. It replaces traditional "alarm" apps with a high-fidelity, command-center aesthetic that empowers users through data-driven safety insights.

---

## ⚡ Core Features

### 🛡️ Identity Verification
ML-inspired biometric scanning sequence. Users verify their identity via a high-contrast camera interface to unlock verified "Buddy" matchmaking and community features.
*(Requires HTTPS to activate browser camera)*

### 🛰️ Live S.O.S Command Center
A rapid-response emergency protocol dashboard. One-tap distress broadcasting that captures live GPS coordinates via `navigator.geolocation` and synchronizes them to a Supabase `emergency_logs` database for immediate operative tracking.

### 🗺️ Terminal Navigation Map
Interactive geospatial dashboard using **React-Leaflet** and **CartoDB Dark Matter** tiles.
- **Risk Zones:** Real-time overlays indicating high, moderate, and safe corridors.
- **Verified Stays:** Pins for SheStay™ vetted locations.
- **Live Tracking:** Dynamic user markers that update as you move.

### 💬 Realtime Buddy Network
WebSocket-powered chat system using Supabase Realtime Channels. Connect with other solo travelers and locals without polling latency, featuring end-to-end mission-style UI.

---

## 🛠️ Technology Stack

- **Framework:** [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- **Backend:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime, Storage)
- **Maps:** [Leaflet](https://leafletjs.com/) via `react-leaflet`
- **Icons:** [Lucide React](https://lucide.dev/)
- **Design System:** Custom **Spade System** (Neon Lime `#ceee93`, Glassmorphism, Space Grotesk Typography)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase Project ([Create one here](https://supabase.com/))

### 2. Installation
```bash
git clone https://github.com/Deepak-kumar-36/SheRoam.git
cd SheRoam
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Database Setup
Run the SQL commands found in `schema.sql` within your Supabase SQL Editor to provision the following tables:
- `users` (extended with `is_verified`)
- `posts` (for community feeds)
- `messages` (realtime chat)
- `emergency_logs` (S.O.S tracking)
- `locations` (map pins)

### 5. Launch
```bash
npm run dev
```

---

## 🌐 Deployment

SheRoam is ready for deployment on **Vercel** or **Netlify**.

> [!IMPORTANT]
> **HTTPS is MANDATORY.** Browser features like `navigator.mediaDevices` (Camera) and `navigator.geolocation` (GPS) will not function on non-secure origins.

---

## 🎨 Design Philosophy (Spade)
SheRoam utilizes the **Spade** design philosophy:
- **Neon Accents:** Primary `#ceee93` (Neon Lime) for visibility in low-light environments.
- **Editorial Typography:** Bold, all-caps identifiers using *Space Grotesk*.
- **Glassmorphism:** Frosted paneling to maintain context with underlying data layers.

---

*Built with ❤️ for Global Women's Safety.*
