---
layout: default
---

## **Modul 1: Pembentukan Kelompok & Perumusan Masalah**

### **a. Nama Produk**

**EcoPoint**

---

### **b. Jenis Produk**

Platform berbasis aplikasi web keberlanjutan berbasis cloud, bertenaga AI, dan berbasis gamifikasi untuk pengelolaan limbah kampus.

---

### **c. Latar Belakang & Permasalahan**

Permasalahan pengelolaan sampah masih menjadi isu lingkungan yang signifikan di Indonesia seiring dengan pertumbuhan populasi, aktivitas konsumsi, serta meningkatnya mobilitas masyarakat di kawasan perkotaan dan lingkungan pendidikan. Berdasarkan data Sistem Informasi Pengelolaan Sampah Nasional (SIPSN), timbulan sampah nasional mencapai puluhan juta ton setiap tahun, namun sebagian besar masih belum dikelola secara optimal. Kondisi ini berpotensi menimbulkan pencemaran lingkungan, meningkatkan emisi gas rumah kaca, serta mempercepat penurunan kapasitas tempat pembuangan akhir (TPA). Selain faktor infrastruktur, rendahnya kesadaran masyarakat dalam memilah sampah sejak dari sumber menjadi salah satu penyebab utama belum efektifnya sistem pengelolaan sampah yang berkelanjutan.

Permasalahan serupa juga terjadi di Daerah Istimewa Yogyakarta, termasuk pada lingkungan kampus yang memiliki aktivitas akademik dan sosial yang padat. Tingginya jumlah mahasiswa serta kegiatan harian di area kampus menghasilkan volume sampah yang tidak sedikit, baik berupa plastik sekali pakai, kertas, maupun sampah organik. Namun, proses pemilahan dan pengelolaan sampah di tingkat individu masih belum berjalan secara konsisten. Kurangnya mekanisme monitoring berbasis data serta minimnya pendekatan yang mendorong partisipasi aktif menyebabkan banyak sampah berpotensi daur ulang tidak tertangani secara optimal.

Di sisi lain, perkembangan teknologi informasi membuka peluang untuk menghadirkan solusi inovatif melalui integrasi jaringan komputer, komputasi awan, dan kecerdasan buatan. Pendekatan gamifikasi yang memanfaatkan sistem poin, badge, dan leaderboard terbukti mampu meningkatkan motivasi pengguna dalam berbagai konteks digital, termasuk perubahan perilaku berbasis lingkungan. Dengan memanfaatkan teknologi web berbasis cloud, sistem dapat menyediakan akses real-time, penyimpanan data terpusat, serta analisis berbasis AI untuk mengidentifikasi pola pengelolaan sampah dan memberikan rekomendasi yang lebih adaptif.

Berdasarkan permasalahan tersebut, diusulkan pengembangan sebuah platform web pengelolaan sampah berbasis gamifikasi di lingkungan kampus sebagai solusi digital yang terintegrasi. Aplikasi ini dirancang untuk mendorong partisipasi mahasiswa dalam aktivitas pemilahan dan pelaporan sampah melalui mekanisme reward yang transparan serta visualisasi progres yang interaktif. Selain itu, penerapan kecerdasan buatan diharapkan dapat membantu proses klasifikasi sampah, analisis perilaku pengguna, serta penyediaan insight bagi pengelola kampus dalam mendukung kebijakan keberlanjutan. Dengan demikian, solusi ini tidak hanya berfungsi sebagai alat pencatatan, tetapi juga sebagai ekosistem digital yang berkontribusi terhadap pencapaian Tujuan Pembangunan Berkelanjutan (SDGs), khususnya pada aspek Responsible Consumption and Production serta Sustainable Cities and Communities.

---

### **d. Ide Solusi**

Untuk menjawab permasalahan rendahnya partisipasi dalam pengelolaan sampah serta kurangnya sistem monitoring berbasis teknologi oleh mahasiswa, diusulkan pengembangan aplikasi pengelolaan sampah berbasis web yang mengintegrasikan konsep gamifikasi, kecerdasan buatan, jaringan komputer, dan komputasi awan. Adapun ide solusi beserta rancangan fitur yang diusulkan adalah sebagai berikut:

#### **1. Pengembangan Fitur AI untuk Mengklasifikasi Jenis-Jenis Sampah**

Aplikasi akan memanfaatkan teknologi kecerdasan buatan (Artificial Intelligence) untuk membantu proses identifikasi jenis sampah secara otomatis melalui analisis citra. Pengguna dapat mengunggah foto sampah saat melakukan pelaporan, kemudian sistem AI akan melakukan klasifikasi ke dalam kategori tertentu seperti plastik, kertas, atau organik.

#### **2. Integrasi ke Cloud Azure sebagai Infrastruktur Penyimpanan dan Deployment**

Sistem akan diintegrasikan dengan layanan komputasi awan Microsoft Azure sebagai infrastruktur utama aplikasi. Pemanfaatan cloud memungkinkan penyimpanan data terpusat, skalabilitas sistem, serta ketersediaan layanan yang lebih stabil dibandingkan penyimpanan lokal.

#### **3. Aplikasi REST API sebagai Penghubung Antar Komponen Sistem**

Untuk memastikan komunikasi yang terstruktur antara frontend, backend, serta layanan AI, sistem akan menggunakan arsitektur berbasis REST API. REST API berfungsi sebagai jembatan komunikasi antar komponen sehingga data dapat ditransmisikan secara efisien dan aman melalui jaringan komputer.

#### **4. Fitur Gamifikasi untuk Meningkatkan Partisipasi Pengguna**

Sebagai pendekatan utama untuk meningkatkan keterlibatan pengguna, aplikasi akan menerapkan konsep gamifikasi melalui sistem poin berdasarkan aktivitas pelaporan sampah, badge atau pencapaian tertentu, serta leaderboard antar individu atau kelompok.

#### **5. Dashboard Monitoring dan Visualisasi Data**

Selain fitur untuk pengguna umum, aplikasi juga menyediakan dashboard khusus bagi admin atau pengelola untuk memantau aktivitas pengelolaan sampah secara real-time. Dashboard ini menampilkan statistik penggunaan, distribusi jenis sampah, serta insight berbasis data yang dapat digunakan untuk pengambilan keputusan.

---

### **Rancangan Fitur Solusi:**

| **Fitur**                           | **Keterangan**                                                                                                                  |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Registrasi & Login Pengguna**     | Sistem autentikasi berbasis akun mahasiswa untuk mengakses aplikasi serta mengelola profil pengguna secara aman.                |
| **Pelaporan Sampah**                | Pengguna dapat melaporkan aktivitas pengelolaan sampah dengan mengunggah foto dan memilih kategori sampah yang sesuai.          |
| **Klasifikasi Sampah Berbasis AI**  | Sistem menggunakan model AI untuk mengidentifikasi jenis sampah dari gambar yang diunggah sehingga meningkatkan akurasi data.   |
| **Sistem Poin dan Badge**           | Setiap aktivitas pengguna akan mendapatkan poin yang dapat diakumulasikan menjadi badge sebagai bentuk gamifikasi.              |
| **Leaderboard Realtime**            | Peringkat pengguna atau kelompok diperbarui secara langsung menggunakan teknologi WebSocket tanpa perlu refresh halaman.        |
| **Notifikasi Aktivitas**            | Sistem memberikan notifikasi terkait pencapaian poin, event lingkungan, atau pembaruan sistem secara realtime.                  |
| **Dashboard Monitoring Admin**      | Admin dapat melihat statistik penggunaan aplikasi, jumlah laporan sampah, serta insight berbasis data melalui dashboard visual. |
| **Integrasi REST API**              | REST API berfungsi sebagai penghubung antara frontend, backend, layanan AI, dan database sehingga sistem lebih modular.         |
| **Penyimpanan Data di Cloud Azure** | Data pengguna dan file gambar disimpan pada layanan cloud untuk mendukung skalabilitas dan ketersediaan sistem.                 |
| **Analitik dan Prediksi Data**      | Sistem menampilkan visualisasi data pengelolaan sampah serta analisis sederhana untuk membantu pengambilan keputusan.           |
| **Manajemen Reward**                | Admin dapat mengatur aturan poin, badge, dan reward yang diberikan kepada pengguna untuk meningkatkan partisipasi.              |
| **Keamanan Data**                   | Implementasi autentikasi token dan enkripsi komunikasi untuk menjaga keamanan data pengguna selama transmisi jaringan.          |

---

### **e. Analisis Kompetitor (Minimal 3 Kompetitor)**

---

#### **KOMPETITOR 1**

|                      |                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Nama**             | Bank Sampah Digital                                                                                                              |
| **Jenis Kompetitor** | Direct                                                                                                                           |
| **Jenis Produk**     | Aplikasi mobile atau web untuk pendaftaran anggota bank sampah, pencatatan setoran, penjadwalan pickup, dan manajemen saldo poin |
| **Target Customer**  | Rumah tangga, anggota bank sampah, pengelola bank sampah/koperasi lokal.                                                         |

| **Kelebihan**                                                                                                                                                                                                                                                                     | **Kekurangan**                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Sudah terhubung dengan jaringan bank sampah fisik, yaitu pengetahuan lokal & mitra lapangan.<br>- Proses penimbangan dan transaksi ekonomi berupa tukar poin atau uang sudah menjadi alur yang familiar.<br>- Biasanya solusi low-cost dan mudah disosialisasikan secara lokal. | - Fitur digital sering terbatas, dalam artian sedikit atau bahkan tidak ada otomasi AI untuk validasi atau klasifikasi.<br>- Keterbatasan skala dan interoperabilitas antar daerah.<br>- Gamifikasi dan mekanisme engagement jangka panjang sering kurang dikembangkan. |

**Key Competitive Advantage & Unique Value**

Keunggulan kompetitor ini adalah keberadaan jaringan fisik berupa bank sampah dan penerimaan komunitas lokal. Namun nilai unik **EcoPoint Campus** adalah menggabungkan gamifikasi, AI untuk validasi dan klasifikasi, dan arsitektur cloud yang memudahkan skala dan analitik serta fitur yang umumnya tidak dimiliki aplikasi bank sampah lokal.

---

#### **KOMPETITOR 2**

|                      |                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Nama**             | Waste4Change                                                                                                                      |
| **Jenis Kompetitor** | Indirect                                                                                                                          |
| **Jenis Produk**     | Layanan pengelolaan sampah komersial berupa pickup, pengolahan, konsultan, kadang disertai portal B2B/B2C untuk jadwal & layanan. |
| **Target Customer**  | Rumah tangga menengah/korporat, kampus, instansi pemerintah, usaha yang membutuhkan layanan pengelolaan penuh.                    |

| **Kelebihan**                                                                                                                                                                                                                    | **Kekurangan**                                                                                                                                                                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Menawarkan layanan end-to-end, yaitu logistik, pengolahan, pelaporan.<br>- Merek atau operasi yang sudah mapan, sehingga memiliki kepercayaan stakeholder<br>- Kapasitas operasional dan kemampuan penanganan material beragam | - Model bisnis berbayar, sehingga kurang cocok sebagai tool adopsi massal tanpa biaya<br>- Fokus operasional, bukan behavior change, dalam artian jarang ada fitur gamifikasi untuk mendorong pemilahan individu<br>- Solusi kurang disesuaikan untuk konteks kampus kecil atau program edukasi mahasiswa. |

**Key Competitive Advantage & Unique Value**

Keunggulan mereka adalah kapabilitas logistik dan layanan komersial. Nilai unik proyek Anda adalah fokus pada perubahan perilaku (gamifikasi), integrasi AI untuk validasi, dan biaya rendah untuk adopsi kampus sehingga cocok sebagai komplemen bisa bermitra alih-alih hanya bersaing.

---

#### **KOMPETITOR 3**

|                      |                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Nama**             | Program Komunitas & Inisiatif                                                                                                     |
| **Jenis Kompetitor** | Tertiary Competitors                                                                                                              |
| **Jenis Produk**     | Website atau gruppe media sosial atau aplikasi sederhana untuk koordinasi acara bersih-bersih, volunteer, dan edukasi lingkungan. |
| **Target Customer**  | Mahasiswa, relawan komunitas, organisasi kemahasiswaan, LSM lokal.                                                                |

| **Kelebihan**                                                                                                                                                                                                                                             | **Kekurangan**                                                                                                                                                                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| - Kekuatan mobilisasi komunitas dan engagement sosial yang tinggi.<br>- Biaya operasional rendah; model kerja sukarelawan yang efektif untuk event-based campaigns.<br>- Relevan untuk edukasi dan kesadaran, mudah mendapat dukungan stakeholder kampus. | - Biasanya tidak memiliki infrastruktur teknis untuk pelaporan terstruktur. Misalnya pencatatan kg dan histori per-user.<br>- Tidak ada interasi marketplace atau logistik atau sistem insentif jangka panjang.<br>- Data yang terhimpun cenderung fragmentaris dan sulit dianalitik secara sistematis. |

**Key Competitive Advantage & Unique Value**

Kekuatan mereka adalah kemampuan komunikasi dan mobilisasi. Nilai unik aplikasi kami adalah memformalisasi partisipasi, menambah elemen economy, reward, dan analitik. Sehingga aktivitas komunitas bisa diubah menjadi data operasional dan dampak yang terukur, serta diintegrasikan dengan bank sampah/pihak pengolah.

---
