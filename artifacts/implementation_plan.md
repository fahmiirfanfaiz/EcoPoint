# Integrasi Daily Challenges & Badges

Sistem saat ini sudah memiliki data *Daily Challenges* (Tantangan Harian) dan *Badges* di database, namun *action* dari user (seperti melapor sampah, mengecek leaderboard, dll) belum dihubungkan untuk menambah progress.

## Rangkuman Tantangan & Badge Saat Ini:
Berdasarkan database, terdapat 5 tantangan harian aktif:
1. **Lapor Sampah 3x** (`challenge_type`: `REPORT`)
2. **Lapor 1 Sampah Hari Ini** (`challenge_type`: `waste_report`)
3. **Cek Leaderboard** (`challenge_type`: `view_leaderboard`)
4. **Tukar 1 Reward** (`challenge_type`: `redeem_reward`)
5. **Login Streak** (`challenge_type`: `login_streak`)

Serta 3 Badges:
1. **First Step!** (`TOTAL_REPORT`: 1)
2. **Eco Warrior Level 2** (`TOTAL_REPORT`: 10)
3. **Pelapor Mantap Jos** (`TOTAL_LAPORAN`: 10)

## User Review Required
> [!IMPORTANT]
> **Progress Pelaporan Sampah:** Apakah progress tantangan "Lapor Sampah" harus dihitung **saat user submit laporan** (meskipun belum divalidasi), atau **saat admin melakukan Approve**?
> Biasanya tantangan harian dihitung saat user melakukan *action* (Submit). Saya akan mengatur agar dihitung saat user **Submit Laporan**, agar user langsung melihat progress-nya. Apakah Anda setuju?

> [!WARNING]
> **Share Invite:** Saat ini belum ada fitur "Undang Teman". Untuk tantangan `share_invite`, saya akan menambahkan tombol "Share" sederhana di halaman Profile. Ketika diklik, akan menyelesaikan tantangan ini. Apakah ini cukup untuk saat ini?

## Proposed Changes

### Backend (Node.js)

#### [NEW] `backend/src/controllers/dailyChallengeController.ts` (Track Action)
- Tambahkan fungsi baru `trackAction(userId, actionType)` yang akan mencari `challenge_of_the_day` milik user berdasarkan `challenge_type` dan menambah *progress*-nya.
- Ekspos fungsi ini ke *route*: `POST /api/daily-challenges/track-action`.
- Mapping action: 
  - `actionType === 'report'` akan men-trigger challenge `REPORT` dan `waste_report`.
  - `actionType === 'view_leaderboard'` akan men-trigger `view_leaderboard`.
  - dsb.

#### [MODIFY] `backend/src/services/achievementService.ts`
- Perbaiki *bug* pencarian status. Saat ini kode mencari `status_validasi: "verified"`, padahal di database ketika di-*approve*, statusnya menjadi `approved`.
- Tambahkan support evaluasi untuk jenis syarat `TOTAL_LAPORAN` (sama perlakuannya dengan `TOTAL_REPORT`).

#### [MODIFY] `backend/src/controllers/wasteReportController.ts`
- Pada fungsi `approveReport`, panggil `evaluateUserAchievements(user_id)` agar *badges* dikalkulasi dan diberikan kepada user jika sudah memenuhi syarat laporan yang di-*approve*.

#### [MODIFY] `backend/src/controllers/dashboardController.ts`
- Pada `getDashboardData`, otomatis panggil `trackAction` untuk `login_streak` setiap kali user membuka dashboard (sekali sehari).

#### [MODIFY] `backend/src/controllers/redemptionController.ts`
- Pada saat penukaran reward berhasil, otomatis panggil `trackAction` untuk `redeem_reward`.

---

### Frontend (Next.js)

#### [MODIFY] `frontend/src/app/api/lapor-sampah/submit/route.ts`
- Setelah laporan berhasil disimpan di Supabase, lakukan *fetch* ke backend Node.js (`POST /api/daily-challenges/track-action` dengan body `{ "action": "report" }`) untuk menambah progress tantangan melapor sampah user.

#### [MODIFY] `frontend/src/app/leaderboard/page.tsx`
- Tambahkan `useEffect` saat halaman di-*load* untuk memanggil `POST /api/daily-challenges/track-action` dengan body `{ "action": "view_leaderboard" }`.

#### [MODIFY] `frontend/src/app/profile/page.tsx`
- Tambahkan tombol **Bagikan Kode Undangan**.
- Saat diklik, akan menyalin URL aplikasi dan memanggil `POST /api/daily-challenges/track-action` dengan body `{ "action": "share_invite" }`.

## Verification Plan
### Manual Verification
1. Login sebagai user.
2. Cek halaman misi harian (seharusnya progress lapor sampah 0/1).
3. Buat laporan sampah baru.
4. Cek misi harian lagi (progress harus menjadi 1/1 dan tombol claim aktif).
5. Kunjungi halaman Leaderboard, lalu kembali ke beranda, misi "Cek Leaderboard" harus selesai.
6. Admin melakukan approve laporan sampai mencapai total 1 laporan dan 10 laporan.
7. User login/navigate dan melihat popup naik level & mendapatkan Badge (First Step! dll).
