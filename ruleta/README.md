# 🎰 Interactive Prize Wheel (React + HTML5 Canvas)

An interactive promotion and prize roulette web application built with **React**, **HTML5 Canvas**, and **SASS**. It allows users to spin an animated wheel with smooth physics, calculate results based on custom probabilities, and persist the obtained state across page reloads.

---

## 🚀 Key Features

- **Dynamic Canvas Rendering:** Parametric drawing of wheel slices, custom color schemes, and responsive typography using the HTML5 Canvas API.
- **Smooth Physics & Animations:** Accelerated rotation with gradual deceleration powered by CSS `cubic-bezier` timing functions and GPU acceleration.
- **Precision Alignment:** Precise angular calibration ($343^\circ$) between the visual ping indicator and the exact center of the winning slice.
- **State Persistence:** Local storage persistence via `localStorage` to preserve the user's won prize and current wheel alignment upon refreshing the page.
- **Global State Management:** Native React Context (`RouletteProvider`) for clean state propagation across the Canvas, forms, and reward modal components.

---

## 🛠️ Tech Stack

- **React** (TypeScript)
- **HTML5 Canvas API**
- **SASS / SCSS**
- **React Context API**
- **localStorage API**

---

## ⚙️ Configuration & Probabilities

The wheel is engineered to support **8 equal segments** ($45^\circ$ per segment). The prizes can be configured through a static JSON structure or passed via the context provider.

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

## 💻 Installation & Setup

Clone the repository:

git clone [https://github.com/sallygongar/react-advanced-apps/tree/main/ruleta](https://github.com/sallygongar/react-advanced-apps/tree/main/ruleta)
cd ruleta

## Install dependencies:

npm install

# or

yarn install

## Build for develop:

npm run dev

## Build for production:

npm run build

## 📐 Rotation Math Formula

The target rotation angle is calculated by combining full extra revolutions with the angular offset of the ping indicator:$$\text{rotationDegree} = (\text{laps} \times 360) + \left[(\text{pingAngle} - \text{winningDegree}) \bmod 360\right]$$pingAngle: The visual coordinate of the pointer indicator ($343^\circ$).winningDegree: The exact mid-point angle of the winning slice (grade).laps: Full rotations prior to coming to a complete stop (e.g., 5 laps during spin mode).

## 📄 License

Distributed under the MIT License.
