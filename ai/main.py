from fastapi import FastAPI, Form, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional

from classify import classify_waste

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