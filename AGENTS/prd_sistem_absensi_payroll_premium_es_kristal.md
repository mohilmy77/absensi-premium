# PRODUCT REQUIREMENT DOCUMENT (PRD)

**Nama Produk:** Sistem Absensi & Payroll Pabrik "Premium Es Kristal"  
**Versi:** 1.0 (MVP)  
**Tipe Platform:** Web Application (Mobile-Responsive untuk Karyawan & Desktop-Optimized untuk Admin)  
**Status Dokumen:** Approved / Ready for Development  

---

## 1. Ikhtisar Produk (Product Overview)

Sistem Absensi Web "Premium Es Kristal" adalah aplikasi presensi operasional pabrik terpadu yang dirancang untuk mengotomatisasi pencatatan kehadiran dan kalkulasi payroll pada operasional pabrik 24 jam. 

Sistem ini mengintegrasikan validasi kehadiran berbasis foto kamera langsung (*live selfie*) dan pembatasan radius geografis (*GPS geofencing*) guna mengeliminasi kecurangan absensi (*titip absen* atau absen di luar lokasi). Selain itu, sistem menyertakan kalkulasi otomatis pemotongan denda upah harian, gamifikasi perolehan poin kehadiran berhadiah bonus tunai, serta penjadwalan roster 3 shift kerja berkesinambungan.

---

## 2. Arsitektur & Tumpukan Teknologi (Tech Stack)

Sistem dibangun menggunakan pendekatan arsitektur monolitik modern berbasis *Single Page Application* (SPA) tanpa perlu membangun REST API terpisah:

*   **Backend Framework:** Laravel 13 (PHP 8.3+)
*   **Monolithic-SPA Bridge:** Inertia.js (v2.x)
*   **Frontend Framework:** Vue.js 3 (Composition API, `<script setup>`)
*   **Styling & UI:** Tailwind CSS (v4.x)
*   **Database Management System:** MySQL 8.0+
*   **State & Asset Bundling:** Vite + Pinia (opsional untuk client state)
*   **File/Image Storage:** Laravel Storage (Local/S3-compatible) untuk arsip foto selfie presensi
*   **Geospatial Calculation:** Haversine Formula (implementasi via database query atau PHP helper service)

---

## 3. Manajemen Peran & Hak Akses (User Roles & Permissions)

| Peran (*Role*) | Deskripsi Pengguna | Hak Akses Utama |
| :--- | :--- | :--- |
| **Karyawan** | Tenaga kerja operasional pabrik (produksi, packing, maintenance, driver, kasir). | <ul><li>Login akun personal.</li><li>Presensi masuk dan pulang via kamera langsung & koordinat GPS.</li><li>Melihat jadwal shift mingguan yang ditetapkan.</li><li>Melihat akumulasi poin & posisi leaderboard reward bulanan.</li><li>Melihat estimasi slip gaji berjalan & histori absensi mandiri.</li></ul> |
| **Admin** | Manajemen pabrik / HRD / Pemilik Pabrik (*Owner*). | <ul><li>Pengelolaan master data karyawan & pengaturan nominal upah.</li><li>Penyusunan jadwal roster shift mingguan.</li><li>Konfigurasi koordinat pabrik & radius geofence.</li><li>Input manual status absensi (izin, sakit, dispensasi).</li><li>Monitoring presensi harian secara real-time.</li><li>Kalkulasi dan ekspor rekapitulasi payroll.</li></ul> |

---

## 4. Aturan Bisnis & Logika Sistem (Core Business Rules)

### 4.1. Penjadwalan Kerja (Roster Shift 24 Jam)
Pabrik beroperasi non-stop 24 jam dengan rotasi 3 shift kerja berstandar waktu WITA:
*   **Shift 1:** 08.00 – 17.00 WITA (Durasi 9 jam: 8 jam kerja efektif + 1 jam istirahat).
*   **Shift 2:** 16.00 – 00.00 WITA (Durasi 8 jam kerja, terdapat *overlap* 1 jam dengan Shift 1 untuk serah terima operasional mesin).
*   **Shift 3:** 00.00 – 08.00 WITA (Durasi 8 jam kerja lintas malam).

### 4.2. Validasi Absensi & Pencegahan Manipulasi
1.  **Geofencing (GPS):**
    *   Karyawan wajib berada di dalam radius toleransi dari titik koordinat pabrik (default: $50 - 100\text{ meter}$).
    *   Jika jarak perangkat karyawan $> \text{Radius Maksimal}$, tombol aksi absensi dinonaktifkan (*disabled*) dan sistem memunculkan indikator peringatan jarak.
2.  **Live Selfie Capture:**
    *   Pengambilan foto wajib menggunakan stream kamera langsung via peramban web (*HTML5 MediaDevices API*).
    *   Fitur input berkas/unggah dari galeri dinonaktifkan total guna mencegah penggunaan foto lama atau gambar manipulasi.

### 4.3. Logika Perolehan Poin Kehadiran (Gamifikasi)
Poin dihitung otomatis setiap kali karyawan melakukan presensi masuk terhadap jam awal shift ($T_0$):

| Kondisi Waktu Masuk | Kategori Keterlambatan | Perolehan Poin |
| :--- | :--- | :--- |
| $\le T_0$ | Tepat Waktu | $+30\text{ Poin}$ |
| $T_0 + 1\text{ menit}$ s.d. $T_0 + 15\text{ menit}$ | Toleransi Keterlambatan | $+20\text{ Poin}$ |
| $T_0 + 16\text{ menit}$ s.d. $T_0 + 30\text{ menit}$ | Terlambat Rendah | $+10\text{ Poin}$ |
| $> T_0 + 30\text{ menit}$ | Terlambat Berat | $0\text{ Poin}$ |

### 4.4. Skema Reward Bulanan
Akumulasi poin dievaluasi pada akhir periode bulan kalender (30 atau 31 hari):

*   **Poin 900 (Maksimal):** Bonus Reward $\text{Rp250.000}$
*   **Poin 750 – 899:** Bonus Reward $\text{Rp150.000}$
*   **Poin 500 – 749:** Bonus Reward $\text{Rp100.000}$
*   **Poin 0 – 499:** Tidak mendapatkan reward ($\text{Rp0}$)
*   **Leaderboard Karyawan Terbaik:** Peringkat peraih poin tertinggi ditampilkan pada dashboard karyawan dan admin sebagai apresiasi performa.

### 4.5. Formula Penggajian & Pemotongan Gaji (Payroll)
*   **Upah Pokok Standar (Default):** $\text{Rp1.500.000 / bulan}$ (Dihitung proporsional harian: $\text{Rp50.000 / hari kalender}$. Pada bulan dengan 31 hari, dasar upah menjadi $\text{Rp1.550.000}$).
*   **Karyawan Senior (> 1 Tahun):** Admin dapat menentukan besaran upah pokok / upah harian secara kustom saat input/edit master data.
*   **Kompensasi Kehadiran:** Jika karyawan tidak hadir tanpa keterangan yang sah, upah harian pada hari tersebut otomatis hangus.

#### Matriks Pemotongan & Denda Absensi:

| Status Kehadiran | Status Upah Harian | Denda / Potongan Tambahan | Keterangan Operasional |
| :--- | :--- | :--- | :--- |
| **Hadir Tepat / Terlambat $\le 60$ mnt** | Dihitung Penuh ($100\%$) | $\text{Rp0}$ | Upah harian penuh diterima. |
| **Terlambat $> 60$ menit** | Dihitung Penuh ($100\%$) | $-\text{Rp25.000}$ | Kena sanksi pemotongan denda disiplin. |
| **Sakit (Surat Dokter)** | Dihitung Penuh ($100\%$) | $\text{Rp0}$ | Diverifikasi dan diinput oleh Admin. |
| **Sakit (Tanpa Surat Dokter)** | Dihitung Penuh ($100\%$) | $-\text{Rp50.000}$ | Upah harian tetap cair, dipotong denda. |
| **Izin (Disetujui Atasan)** | Dihitung Penuh ($100\%$) | $\text{Rp0}$ | Kuota izin resmi disetujui Admin. |
| **Izin (Tanpa Persetujuan)** | Hangus ($\text{Rp0}$) | $-\text{Rp100.000}$ | Upah harian hangus + denda indisipliner. |
| **Alpa / Mangkir** | Hangus ($\text{Rp0}$) | $-\text{Rp100.000}$ | Upah harian hangus + denda indisipliner. |

$$\text{Total Gaji Diterima} = (\text{Hari Masuk Kerja} \times \text{Upah Harian}) + \text{Bonus Reward Poin} - \text{Total Denda Potongan}$$

---

## 5. Rincian Kebutuhan Fitur (Feature Specifications)

### Modul 1: Manajemen Akun & Pengguna (Admin)
*   CRUD data master karyawan: NIK, Nama Lengkap, Divisi (`Produksi`, `Packing`, `Maintenance`, `Driver`, `Administrasi`), No. Handphone/WhatsApp, Status Karyawan (`Baru` / `Lama > 1 Tahun`), dan Nominal Upah Harian/Bulanan Kustom.
*   Fitur reset password dan switch toggle status aktif/non-aktif akun karyawan.

### Modul 2: Penjadwalan Shift Mingguan (Admin)
*   Tampilan antarmuka kalender matriks mingguan untuk memetakan penugasan kerja per karyawan (`Shift 1`, `Shift 2`, `Shift 3`, atau `Libur`).
*   Validasi otomatis: Sistem mendeteksi jadwal shift yang aktif saat karyawan membuka halaman presensi pada tanggal terkait.

### Modul 3: Konfigurasi Geofencing & Lokasi Pabrik (Admin)
*   Form input titik koordinat pabrik (*Latitude* & *Longitude*).
*   Slider dinamis penetapan radius batas absensi dalam satuan meter (misal: 50m – 100m) yang langsung tersinkronisasi dengan kalkulasi jarak di client-side.

### Modul 4: Pencatatan Status Absensi Manual (Admin)
*   Form pencatatan ketidakhadiran karyawan: Sakit (dengan/tanpa surat dokter), Izin (disetujui/tidak disetujui), dan Alpa.
*   Pencatatan tanggal mulai dan selesai izin/sakit untuk efisiensi input multi-hari.

### Modul 5: Presensi Masuk & Keluar (Karyawan)
*   Penampil jam digital real-time beserta ringkasan shift aktif karyawan hari ini.
*   Komponen *Geolocator* client-side yang menghitung jarak secara instan ke titik pabrik.
*   Komponen *Webcam Stream* untuk pengambilan foto selfie langsung (larangan unggah file lokal).
*   Penyimpanan snapshot selfie, koordinat latitude-longitude, jam absensi, dan perhitungan skor poin seketika.

### Modul 6: Dashboard Karyawan (Mobile-Optimized)
*   Kartu status shift hari ini: Belum Absen, Sudah Masuk, Sudah Pulang.
*   Widget progres reward poin bulanan interaktif (menampilkan perolehan poin dan selisih menuju batas reward berikutnya).
*   Papan banner *Karyawan Terbaik Bulan Ini*.
*   Ringkasan estimasi slip gaji berjalan (akumulasi upah masuk + estimasi bonus reward - total denda potongan).

### Modul 7: Dashboard & Laporan Admin (Desktop-Optimized)
*   Ringkasan metrik harian: Total hadir tepat waktu, terlambat, sakit/izin, dan mangkir hari ini.
*   Tabel audit presensi harian (termasuk thumbnail selfie, koordinat GPS, dan jam absen).
*   Laporan rekapitulasi penggajian bulanan otomatis dengan tombol ekspor ke format Microsoft Excel (`.xlsx`) dan CSV.

---

## 6. Desain Skema Database Relasional (MySQL)

```
users (id, nik, name, phone, role, is_active, password)
  │
  ├── employee_profiles (id, user_id, division, employment_status, daily_wage, joined_date)
  │
  ├── shift_schedules (id, user_id, date, shift_type [1, 2, 3, OFF])
  │
  ├── attendances (id, user_id, schedule_id, date, clock_in, clock_out, 
  │                in_latitude, in_longitude, in_photo_path, points_earned, 
  │                attendance_status, late_minutes, penalty_amount)
  │
  └── payroll_summaries (id, user_id, period_month, period_year, base_earnings, 
                         reward_bonus, total_penalties, net_salary, status)

factory_settings (id, factory_name, latitude, longitude, radius_meters)
```

---

## 7. Rencana Fase Pengembangan (Roadmap)

### Fase 1: Minimum Viable Product (MVP) — *Saat Ini*
*   Implementasi autentikasi & otorisasi peran (Admin & Karyawan).
*   Manajemen master data karyawan dan pengaturan geofence pabrik.
*   Matriks penjadwalan shift mingguan.
*   Presensi live webcam & GPS geofencing untuk Shift 1, 2, dan 3.
*   Kalkulator otomatis poin reward, denda keterlambatan, dan rekap payroll (Excel/CSV).
*   Dashboard Karyawan (Mobile View) & Panel Admin (Desktop View).

### Fase 2: Peningkatan & Fitur Lanjutan (*Next Milestone*)
*   **Self-Service Portal Karyawan:** Modul pengajuan izin, sakit, dan cuti mandiri disertai upload bukti surat dokter langsung oleh karyawan untuk ditinjau oleh Admin.
*   **Modul Lembur (Overtime):** Deteksi otomatis kelebihan jam kerja setelah waktu pulang shift berakhir dan formula perhitungan upah lembur per jam.
*   **Presensi Dinamis Driver:** Mode pelacakan geofencing berbasis rute pengiriman es kristal luar kota bagi armada logistik/sopir.