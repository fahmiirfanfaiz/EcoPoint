Setup dan contoh penggunaan endpoint klasifikasi sampah

Environment variables (letakkan di `.env` atau sistem):

- `GOOGLE_API_KEY` - API key Google AI Studio / Gemini API
- `GEMINI_MODEL` - opsional, default `gemini-2.0-flash`
- `GEMINI_MAX_RETRIES` - opsional, default `2` (retry otomatis saat 429/503)

Install & jalankan (di dalam folder `ai`):

```bash
uv install  # jika menggunakan uvenv/uv tooling; atau gunakan pip/poetry sesuai workflow
# contoh menjalankan langsung dengan uvicorn
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Endpoint utama:

- `POST /lapor-sampah` - terima form file gambar (`file`), kembalikan prediksi label dan confidence.

Contoh fetch dari frontend (JS):

```js
const form = new FormData();
form.append("file", fileInput.files[0]);

const res = await fetch("/lapor-sampah", {
  method: "POST",
  body: form,
});
const data = await res.json();
console.log(data);
```

Catatan:

- Pastikan VS Code menggunakan interpreter Python dari `ai/.venv` jika Anda memakai virtual environment lokal.
- Endpoint Gemini Google akan dipanggil otomatis oleh wrapper di `classifier.py`.
- Jika mendapat 429, penyebab umum adalah quota per menit/hari project API key sudah habis, bukan hanya request dari app ini.
- Coba turunkan model ke `gemini-1.5-flash`, tunggu cooldown, atau gunakan API key lain dengan quota aktif.
