from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from classify import classify_waste
from classify import verify_cleanup

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "EcoPoint AI classifier is running"}

@app.post("/classify")
async def classify(description: Optional[str] = Form(None), file: UploadFile = File(None)):
    if not description and not file:
        raise HTTPException(status_code=400, detail="Provide `description` or upload an image file")

    image_bytes = None
    mime_type = "image/jpeg" # Default MIME
    
    if file:
        image_bytes = await file.read()
        mime_type = file.content_type # Ambil mime type asli dari file (misal image/png)

    # Panggil fungsi yang sudah di-refactor
    result = classify_waste(
        description=description, 
        image_bytes=image_bytes, 
        mime_type=mime_type
    )
    
    return {"ok": True, "result": result}

@app.post("/verify-cleanup")
async def verify_cleanup_endpoint(before_image: UploadFile = File(...), after_image: UploadFile = File(...), location: Optional[str] = Form(None)):
    """
    Endpoint verifikasi kebersihan.
    Menerima 2 file gambar (before & after) via multipart/form-data.
    """

    ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"}

    if before_image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"File 'before image' harus berupa gambar: {before_image.content_type}")
    
    if after_image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail=f"File 'after image' harus berupa gambar: {after_image.content_type}")
    
    before_bytes = await before_image.read()
    after_bytes  = await after_image.read()
    
    result = verify_cleanup(
        before_image=before_bytes,
        after_image=after_bytes,
        before_mime=before_image.content_type,
        after_mime=after_image.content_type,
        location=location
    )
    return {"ok": True, "result": result}