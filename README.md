# Trash AI Wrapper

A minimal Express + TypeScript REST API that wraps Claude to classify trash images.

---

## Setup

```bash
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
```

## Run

```bash
# Development (auto-reload)
npm run dev

# Production
npm run build && npm start
```

---

## Endpoint

### `POST /api/classify`

Accepts a `multipart/form-data` request with an `image` field.

**Request (from frontend):**
```js
const form = new FormData();
form.append("image", file); // File object from <input type="file">

const res = await fetch("http://localhost:3001/api/classify", {
  method: "POST",
  body: form,
});

const json = await res.json();
```

**Success response `200`:**
```json
{
  "success": true,
  "data": {
    "category": "Plastic",
    "confidence": 94,
    "item_detected": "plastic water bottle",
    "disposal_tip": "Rinse and place in the blue recycling bin.",
    "top_alternatives": [
      { "category": "Glass", "confidence": 4 },
      { "category": "General Waste", "confidence": 2 }
    ]
  }
}
```

**Error response `400 / 500`:**
```json
{
  "success": false,
  "error": "No image file provided. Use field name 'image'."
}
```

---

## Categories

| Category       | Description                          |
|----------------|--------------------------------------|
| Plastic        | Bottles, bags, packaging             |
| Glass          | Bottles, jars                        |
| Metal          | Cans, foil, tin                      |
| Paper/Cardboard| Boxes, newspaper, cups               |
| Organic/Food   | Food scraps, fruit peels             |
| E-Waste        | Batteries, cables, electronics       |
| Hazardous      | Chemicals, paint, syringes           |
| General Waste  | Mixed/non-recyclable trash           |

---

## Health Check

```
GET /health
→ { "status": "ok", "service": "trash-ai-wrapper" }
```
