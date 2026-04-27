# SheRoam · Safety as a State of Mind

![SheRoam Banner](https://img.shields.io/badge/Design_System-Spade-ceee93?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Backend-Supabase-3ecf8e?style=for-the-badge&logo=supabase)
![React](https://img.shields.io/badge/Frontend-React_19-61dafb?style=for-the-badge&logo=react)
![Map](https://img.shields.io/badge/Safety_Map-India_Centric-ff4a8d?style=for-the-badge)

**SheRoam** is a premium, high-tech women's safety platform transformed for the Indian landscape. Designed with a focus on editorial typography, glassmorphism, and real-time backend integration, it provides localized safety intel, safe routing, and rapid emergency protocols tailored for the unique needs of women in India.

---

## ⚡ Core Features

### 🗺️ India-Centric Threat Map
Interactive geospatial dashboard pre-seeded with major Indian cities and safety data (Delhi, Mumbai, Bangalore, etc.).
- **Nominatim Search:** Search any Indian city or location with localized geocoding.
- **Risk Zones:** Real-time overlays indicating high, moderate, and safe corridors.
- **Verified Stays:** Pins for SheStay™ vetted locations.
- **Live Incidents:** Real-time markers for reported harassment, theft, and assault.

### 🛡️ Identity & Video Verification
Secure verification flow for the Indian community.
- **Video Submission:** Record a short video with ID proof for manual admin verification.
- **Admin Terminal:** Dedicated portal for a female verification team to approve new operatives.

### 🛰️ Safe Route Finder
AI-powered routing integrated with **OpenRouteService (ORS)**.
- **Safety Analysis:** Automatically calculates the safest path between two points in India.
- **Color-coded Segments:** Green (Safe) → Amber (Moderate) → Red (High Risk) based on proximity to reported incidents and community scores.
- **GPS Integration:** One-tap "My Location" routing.

### 🎤 Voice Guard S.O.S
Advanced distress detection using the **Web Speech API**.
- **Multi-lingual Detection:** Listens for distress keywords in both **Hindi** ("Bachao", "Madad") and **English** ("Help", "Police").
- **Auto-Trigger:** Detection initiates a 5-second countdown before automatically broadcasting an S.O.S signal.
- **GPS Sync:** Synchronizes live coordinates to the Supabase `emergency_logs` for immediate response.

### 📊 Community Safety Scoring
Crowd-sourced safety intelligence.
- **Safe Score:** Rate any location from 0–10 based on personal safety experience.
- **Incident Reporting:** Anonymous reporting for different incident types (Harassment, Stalking, etc.).
- **Area Intel:** Summary statistics shown for locations, including community percentage scores and incident breakdowns.

---

## 🛠️ Technology Stack

- **Framework:** [Vite](https://vitejs.dev/) + [React 19](https://react.dev/)
- **Backend:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Realtime, Storage)
- **Routing:** [OpenRouteService (ORS)](https://openrouteservice.org/)
- **Voice Engine:** Web Speech API
- **Maps:** [Leaflet](https://leafletjs.com/) via `react-leaflet`
- **Icons:** [Lucide React](https://lucide.dev/)
- **Design System:** Custom **Spade System** (Neon Lime `#ceee93`, Glassmorphism, Space Grotesk Typography)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- A Supabase Project ([Create one here](https://supabase.com/))
- An OpenRouteService API Key ([Register here](https://openrouteservice.org/dev/#/signup))

### 2. Installation
```bash
git clone https://github.com/Deepak-kumar-36/SheRoam.git
cd SheRoam
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory and add your credentials:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_ORS_API_KEY=your_ors_api_key
VITE_ADMIN_PASSWORD=your_admin_panel_entry_password
```

### 4. Database Setup
Run the SQL commands found in `schema.sql` within your Supabase SQL Editor to provision the following:
- **Core Tables:** `users`, `posts`, `messages`, `emergency_logs`.
- **Safety Data:** `safe_scores`, `incidents`, `locations`.
- **Seed Data:** Includes 40+ major Indian safety zones and landmarks.

### 5. Launch
```bash
npm run dev
```

---

## 🌐 Deployment

SheRoam is optimized for deployment on **Vercel**.

> [!IMPORTANT]
> **HTTPS is MANDATORY.** Browser features like `Web Speech API` (Voice Guard), `navigator.mediaDevices` (Camera Verification), and `navigator.geolocation` (GPS) will not function on non-secure origins.

---

## 🎨 Design Philosophy (Spade)
- **Neon Accents:** Primary `#ceee93` (Neon Lime) for visibility in low-light environments.
- **Aesthetic Focus:** Transitioning towards a softer, aesthetic palette tailored for intuitive use.
- **Editorial Typography:** Bold, all-caps identifiers using *Space Grotesk*.

---

*Built with ❤️ for Women's Safety in India.*
