# Task: Integrasi Daily Challenges & Badges

- [x] **Backend - Challenge Tracker Endpoint**
  - [x] Buat file/fungsi `trackAction` di `dailyChallengeController.ts`
  - [x] Tambahkan route `POST /api/daily-challenges/track-action`

- [x] **Backend - Achievement Service**
  - [x] Perbaiki status pengecekan laporan dari `"verified"` ke `"approved"` di `evaluateUserAchievements`.
  - [x] Tambahkan kalkulasi untuk `TOTAL_LAPORAN` di `evaluateUserAchievements`.
  - [x] Tambahkan kalkulasi untuk `LOGIN_STREAK` (bisa dicek dari tabel `users` / jika butuh ditambah kolom).
  - [x] Tambahkan kalkulasi untuk `CHALLENGE_SELESAI` (hitung `user_daily_challenges` yang `is_completed: true`).

- [x] **Backend - Triggers**
  - [x] Panggil `evaluateUserAchievements` di `approveReport` (wasteReportController.ts).
  - [x] Tambahkan kolom `login_streak` dan `last_login_date` di `users` table via Prisma schema jika belum ada (atau jika belum ter-manage).
  - [x] Panggil `trackAction` untuk `login_streak` di `dashboardController.ts`.
  - [x] Panggil `trackAction` untuk `redeem_reward` di `redemptionController.ts`.

- [x] **Frontend - Triggers**
  - [x] Panggil `/api/daily-challenges/track-action` (waste_report) di `submit/route.ts`.
  - [x] Panggil `/api/daily-challenges/track-action` (view_leaderboard) di halaman `leaderboard/page.tsx`.
  - [x] Tambahkan fitur "Bagikan Undangan" di Profile dan panggil `share_invite`.
