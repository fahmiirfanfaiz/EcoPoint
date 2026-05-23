# Setup dan Contoh Penggunaan Endpoint Klasifikasi Sampah (AI Service)

Layanan AI ini dibangun menggunakan **FastAPI** dan **Google GenAI SDK** versi terbaru (`google-genai`).

## Environment Variables
Letakkan konfigurasi berikut di file `.env` di dalam folder `ai/`:

- `GOOGLE_API_KEY` atau `GEMINI_API_KEY` - API key Google AI Studio / Gemini API.
- `AI_SERVICE_API_KEY` - API Key internal untuk mengamankan endpoint FastAPI (harus dikirim di header `X-API-Key`).

## Cara Install dan Menjalankan

### Menggunakan Pip (Rekomendasi jika tidak ada `uv`):
1. Masuk ke folder `ai`:
   ```bash
   cd ai
   ```
2. Buat Virtual Environment (opsional tapi sangat direkomendasikan):
   ```bash
   python -m venv .venv
   .venv\Scripts\activate  # Windows
   # atau: source .venv/bin/activate (Linux/Mac)
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

---

## Endpoint API Utama

Semua request (kecuali root `/`) wajib menyertakan header **`X-API-Key`** dengan nilai yang sesuai dengan `AI_SERVICE_API_KEY` di `.env`.

### 1. `POST /classify`
Mengklasifikasikan sampah berdasarkan teks deskripsi dan/atau unggahan berkas gambar.

* **Headers**:
  * `X-API-Key`: `<AI_SERVICE_API_KEY>`
* **Body (Multipart Form Data)**:
  * `description`: Teks deskripsi sampah (opsional)
  * `file`: Berkas gambar sampah (opsional)
* **Response**:
  ```json
  {
    "ok": true,
    "result": {
      "category": "anorganik",
      "confidence": 0.95,
      "explanation": "Botol plastik tergolong sampah anorganik karena terbuat dari polimer sintetik yang sulit terurai secara alami."
    }
  }
  ```

### 2. `POST /verify-cleanup`
Memverifikasi apakah suatu area sudah dibersihkan dengan membandingkan foto kondisi sebelum (*before*) dan sesudah (*after*).

* **Headers**:
  * `X-API-Key`: `<AI_SERVICE_API_KEY>`
* **Body (Multipart Form Data)**:
  * `before_image`: File gambar sebelum dibersihkan (wajib)
  * `after_image`: File gambar setelah dibersihkan (wajib)
  * `location`: Deskripsi lokasi (opsional)
* **Response**:
  ```json
  {
    "ok": true,
    "result": {
      "status": "cleaned",
      "confidence": 0.98,
      "before_description": "Tumpukan sampah plastik berserakan di tepi jalan.",
      "after_description": "Area bersih tanpa ada sampah plastik tersisa.",
      "explanation": "Gambar setelah menunjukkan area yang sama dengan gambar sebelum namun dalam kondisi bersih.",
      "reward_eligible": true
    }
  }
  ```

---

## Contoh Integrasi Frontend (JS Fetch)

```js
const form = new FormData();
form.append("file", fileInput.files[0]);

const res = await fetch("http://localhost:8000/classify", {
  method: "POST",
  headers: {
    "X-API-Key": "your_ai_service_api_key_here"
  },
  body: form,
});
const data = await res.json();
console.log(data);
```
