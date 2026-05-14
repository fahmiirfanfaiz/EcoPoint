from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import classifier

app = FastAPI()

# Allow requests from the frontend; adjust origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/lapor-sampah")
async def lapor_sampah(file: UploadFile = File(...)):
    """Receive uploaded image, forward to Gemini wrapper, and return prediction."""
    try:
        content = await file.read()
        mime_type = file.content_type or "image/jpeg"
        result = await classifier.classify_image(content, mime_type=mime_type)
        return {"status": "ok", "prediction": result}
    except RuntimeError as e:
        msg = str(e)
        if "Gemini API error 429" in msg:
            raise HTTPException(
                status_code=429,
                detail="Gemini quota/rate limit tercapai. Coba lagi beberapa saat atau ganti model/key.",
            )
        if "Gemini API error 403" in msg:
            raise HTTPException(
                status_code=403,
                detail="Akses Gemini ditolak. Periksa GOOGLE_API_KEY dan izin API di Google AI Studio.",
            )
        raise HTTPException(status_code=502, detail="Upstream Gemini error")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Hello World!"}
