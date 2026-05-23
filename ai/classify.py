import os
import json
from typing import Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from enum import Enum

from google import genai
from google.genai import types

load_dotenv()

# Gunakan SDK Google GenAI versi terbaru.
# Dukung dua nama env var agar kompatibel dengan konfigurasi lama.
GOOGLE_GENAI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

if not GOOGLE_GENAI_API_KEY:
    raise RuntimeError("Missing GEMINI_API_KEY or GOOGLE_API_KEY in AI service environment")

client = genai.Client(api_key=GOOGLE_GENAI_API_KEY)
MODEL_NAME = "gemini-2.5-flash" # Gunakan model Flash yang stabil dan dukung multimodal

# 1. Definisikan Enum untuk memaksa AI hanya memilih 5 kategori ini
class WasteCategory(str, Enum):
    ORGANIK = "organik"
    ANORGANIK = "anorganik"
    B3 = "bahan berbahaya dan beracun"
    KERTAS = "kertas"
    RESIDU = "residu yang dibungkus"

# 2. Definisikan Schema Output menggunakan Pydantic
class WasteClassification(BaseModel):
    category: WasteCategory = Field(description="Kategori jenis sampah")
    confidence: float = Field(description="Tingkat keyakinan AI dari angka 0.0 sampai 1.0")
    explanation: str = Field(description="Alasan singkat 1-2 kalimat mengapa masuk kategori ini")

class CleanupStatus(str, Enum):
    CLEANED = "cleaned"
    NOT_CLEANED = "not_cleaned"
    PARTIALLY_CLEANED = "partially_cleaned"
    UNRELATED = "unrelated_images"

class CleanupClassification(BaseModel):
    status: CleanupStatus = Field(description="Status kebersihan berdasarkan gambar masukan")
    confidence: float = Field(description="Tingkat keyakinan AI dari angka 0.0 sampai 1.0")
    before_description: Optional[str] = Field(description="Deskripsi singkat kondisi sebelum dibersihkan")
    after_description: Optional[str] = Field(description="Deskripsi singkat kondisi setelah dibersihkan")
    explanation: str = Field(description="Alasan singkat 1-2 kalimat mengapa masuk status ini")
    reward_eligible: bool = Field(description="Apakah status ini memenuhi syarat untuk reward")


def classify_waste(description: Optional[str] = None, image_bytes: Optional[bytes] = None, mime_type: str = "image/jpeg") -> dict:
    """
    Menggunakan Gemini API dengan Structured Output (Pydantic Schema) 
    agar respons selalu berupa JSON yang valid.
    """
    contents = []
    
    # System Prompt yang jelas
    system_instruction = """
    Kamu adalah sistem AI pakar lingkungan. Tugasmu mengklasifikasikan sampah ke dalam 5 kategori:
    organik, anorganik, bahan berbahaya dan beracun, kertas, atau residu yang dibungkus.
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
    
def verify_cleanup(before_image: bytes, after_image: bytes, before_mime: str = "image/jpeg", after_mime: str = "image/jpeg", location: Optional[str] = None) -> dict:
    """
    Fungsi untuk memverifikasi apakah suatu area sudah dibersihkan berdasarkan gambar sebelum dan sesudah.
    Outputnya mengikuti skema CleanupClassification.
    """
    contents = []
    
    system_instruction = """
    Kamu adalah sistem AI pakar lingkungan. Tugasmu menentukan apakah suatu area sudah dibersihkan berdasarkan gambar sebelum dan sesudah.
    Kategorikan statusnya sebagai cleaned, not cleaned, partially cleaned, atau unrelated_images.
    """
    contents.append(system_instruction)

    if location:
        contents.append(f"Lokasi sampah: {location}")

    # Kirim gambar sebelum dan sesudah
    contents.append(types.Part.from_bytes(data=before_image, mime_type=before_mime))
    contents.append(types.Part.from_bytes(data=after_image, mime_type=after_mime))

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=CleanupClassification,
                temperature=0.1
            )
        )
        
        return json.loads(response.text)
        
    except Exception as e:
        return {
            "status": "error",
            "confidence": 0.0,
            "before_description": None,
            "after_description": None,
            "explanation": f"Failed to call Gemini API: {str(e)}",
            "reward_eligible": False
        }

if __name__ == "__main__":
    # Test lokal
    print(classify_waste(description="Sebuah botol plastik air mineral bekas"))