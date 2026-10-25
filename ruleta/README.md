# 🎰 Interactive Prize Wheel (React + HTML5 Canvas + Supabase)

An interactive promotion and prize roulette web application built with **React**, **HTML5 Canvas**, **SASS** and **Supabase**. It allows users to spin an animated wheel with smooth physics, calculate results based on custom probabilities, and persist the obtained state across page reloads, both in the browser (`localStorage`) and in the database (Supabase).

---

## 🚀 Key Features

- **Dynamic Canvas Rendering:** Parametric drawing of wheel slices, custom color schemes, and responsive typography using the HTML5 Canvas API.
- **Smooth Physics & Animations:** Accelerated rotation with gradual deceleration powered by CSS `cubic-bezier` timing functions and GPU acceleration.
- **Precision Alignment:** Precise angular calibration ($343^\circ$) between the visual ping indicator and the exact center of the winning slice.
- **Dual State Persistence:** The user's email and won prize are stored in `localStorage` (to preserve the result and wheel alignment on refresh) and are also saved in **Supabase** (to keep a permanent record and prevent the same email from playing more than once per event).
- **Server-side Play Verification:** Before every spin, the app checks Supabase through a serverless endpoint to confirm whether the user has already played.
- **Global State Management:** Native React Context (`RouletteProvider`) for clean state propagation across the Canvas, forms, and reward modal components.

---

## 🛠️ Tech Stack

- **React** (TypeScript)
- **HTML5 Canvas API**
- **SASS / SCSS**
- **React Context API**
- **localStorage API**
- **Supabase** (database)
- **Vercel Serverless Functions** (`/api`)

---

## 💾 Data Persistence

The result of each game is stored in two places:

### 1. Browser (`localStorage`)

| Key                     | Content                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `roulette_email`        | `{ "email": "user@example.com" }`                                  |
| `roulette_prize_result` | Prize obtained (code, description, `winningDegree`, `isWin`, etc.) |

It is used to restore the prize and the final wheel position when the page is reloaded.

### 2. Database (Supabase)

When the wheel stops, the winner is saved in Supabase through the `/api/save-winner` endpoint with the following data:

- `email`
- `code`
- `description`
- `winningDegree`
- `isWin`
- `prize_id`
- `event_type`

### API endpoints

| Endpoint           | Method     | Purpose                                                                                           |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------- |
| `/api/prizes`      | GET        | Returns the active prizes used to build the wheel.                                                |
| `/api/check-user`  | GET / POST | Checks in Supabase whether an email has already played in the active event and returns its prize. |
| `/api/save-winner` | POST       | Saves the result of the game in Supabase.                                                         |

> ℹ️ Supabase is the source of truth. If `localStorage` is cleared or the user switches device or browser, the prize is recovered from Supabase using the email. The wheel stays locked for emails that have already played.

---

## ⚙️ Configuration & Probabilities

The wheel is engineered to support **8 equal segments** ($45^\circ$ per segment). The prizes are loaded from the `/api/prizes` endpoint and can also be defined through a static JSON structure for local testing.

> ⚠️ **Validation Rule:** The total sum of probabilities across all 8 items must equal **1.0 (100%)**.

### Sample Configuration (`promotions.json`):

```json
[
  {
    "description": "*30%*\noff sunscreen\n*products*",
    "code": "30PROSOLAR",
    "probability": 0.2,
    "isWin": true,
    "range": [0, 45],
    "grade": 22.5
  },
  {
    "description": "*Keep*\nTrying",
    "code": "SIGUEINTEN",
    "probability": 0.2,
    "isWin": false,
    "range": [45, 90],
    "grade": 67.5
  },
  {
    "description": "*15%*\noff\n*Face Masks*",
    "code": "15MASCARILLA",
    "probability": 0.15,
    "isWin": true,
    "range": [90, 135],
    "grade": 112.5
  },
  {
    "description": "*Free*\nShipping",
    "code": "ENVIOGRATS",
    "probability": 0.15,
    "isWin": true,
    "range": [135, 180],
    "grade": 157.5
  },
  {
    "description": "*20%*\noff all\nfacial care",
    "code": "20TODOSFAC",
    "probability": 0.1,
    "isWin": true,
    "range": [180, 225],
    "grade": 202.5
  },
  {
    "description": "*Better*\nLuck Next Time",
    "code": "NOGANASTE",
    "probability": 0.1,
    "isWin": false,
    "range": [225, 270],
    "grade": 247.5
  },
  {
    "description": "*10%*\noff storewide",
    "code": "10ENTODALATIENDA",
    "probability": 0.08,
    "isWin": true,
    "range": [270, 315],
    "grade": 292.5
  },
  {
    "description": "*12%*\noff hydrating\n*creams*",
    "code": "12ENCREMASHIDRA",
    "probability": 0.07,
    "isWin": true,
    "range": [315, 360],
    "grade": 337.5
  }
]
```

---

## 💻 Installation & Setup

Clone the repository:

```bash
git clone https://github.com/sallygongar/react-advanced-apps.git
cd react-advanced-apps/ruleta
```

Install dependencies:

```bash
npm install
# or
yarn install
```

### Environment variables

Create a `.env` file in the `ruleta` folder (never commit it):

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ACTIVE_EVENT=your_active_event_name
```

> 🔒 The `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security. It must only be used in the serverless functions inside `api/`, never in `src/` and never with the `VITE_` prefix.

When deploying to Vercel, add the same variables in **Project → Settings → Environment Variables**, since the local `.env` file is not uploaded.

Run in development:

```bash
npm run dev
```

> The `/api` functions only run locally with `vercel dev`. With plain `vite`, the endpoints will not respond.

Build for production:

```bash
npm run build
```

---

## 📐 Rotation Math Formula

The target rotation angle is calculated by combining full extra revolutions with the angular offset of the ping indicator:

$$\text{rotationDegree} = (\text{laps} \times 360) + \left[(\text{pingAngle} - \text{winningDegree}) \bmod 360\right]$$

- `pingAngle`: The visual coordinate of the pointer indicator ($343^\circ$).
- `winningDegree`: The exact mid-point angle of the winning slice (`grade`).
- `laps`: Full rotations prior to coming to a complete stop (e.g., 5 laps during spin mode).

---

## 📄 License

Distributed under the MIT License.
