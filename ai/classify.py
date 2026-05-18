import os
import json
from typing import Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from enum import Enum

from google import genai
from google.genai import types

load_dotenv()

# Gunakan SDK Google GenAI versi terbaru
# Pastikan environment variable kamu bernama GEMINI_API_KEY
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_NAME = "gemini-2.5-flash" # Gunakan model Flash yang stabil dan dukung multimodal

# 1. Definisikan Enum untuk memaksa AI hanya memilih 5 kategori ini
class WasteCategory(str, Enum):
    ORGANIK = "organik"
    ANORGANIK = "anorganik"
    B3 = "bahan berbahaya & beracun"
    KERTAS = "kertas"
    RESIDU = "residu yang dibungkus"

# 2. Definisikan Schema Output menggunakan Pydantic
class WasteClassification(BaseModel):
    category: WasteCategory = Field(description="Kategori jenis sampah")
    confidence: float = Field(description="Tingkat keyakinan AI dari 0.0 sampai 1.0")
    explanation: str = Field(description="Alasan singkat 1-2 kalimat mengapa masuk kategori ini")

def classify_waste(description: Optional[str] = None, image_bytes: Optional[bytes] = None, mime_type: str = "image/jpeg") -> dict:
    """
    Menggunakan Gemini API dengan Structured Output (Pydantic Schema) 
    agar respons selalu berupa JSON yang valid.
    """
    contents = []
    
    # System Prompt yang jelas
    system_instruction = """
    Kamu adalah sistem AI pakar lingkungan. Tugasmu mengklasifikasikan sampah ke dalam 5 kategori:
    organik, anorganik, bahan berbahaya & beracun, kertas, atau residu yang dibungkus.
    Analisis gambar dan/atau deskripsi yang diberikan.
    """
    contents.append(system_instruction)

    if description:
        contents.append(f"Deskripsi pengguna: {description}")

    # Cara BENAR mengirim gambar ke Gemini API
    if image_bytes:
        contents.append(
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        )

    try:
        # Panggil API menggunakan model.generate_content
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                # Ini adalah magic-nya: Memaksa output menjadi JSON sesuai skema Pydantic
                response_mime_type="application/json",
                response_schema=WasteClassification,
                temperature=0.1 # Suhu rendah agar AI lebih deterministik/pasti
            )
        )
        
        # response.text otomatis berupa string JSON yang valid
        return json.loads(response.text)
        
    except Exception as e:
        # Penanganan error standar
        return {
            "category": "error",
            "confidence": 0.0,
            "explanation": f"Failed to call Gemini API: {str(e)}"
        }

if __name__ == "__main__":
    # Test lokal
    print(classify_waste(description="Sebuah botol plastik air mineral bekas"))