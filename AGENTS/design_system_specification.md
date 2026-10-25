# Design Specification: Dashboard Karyawan (Premium Es Kristal - Blue Ice Edition)

Dokumen ini berfungsi sebagai panduan referensi desain dan implementasi UI (Frontend / Design System) untuk modul **Dashboard Karyawan - Absensi & Payroll** dengan tema warna utama **Biru Kristal (*Cool Crystal Blue*)**.

---

## 1. Overview & Karakteristik Desain

* **Gaya Desain:** Clean, Modern, SaaS Enterprise dengan nuansa *Cool Crystal Ice* (dominan putih, slate sejuk, dan spektrum biru terkoordinasi).
* **Target Pengguna:** Karyawan operasional & staf pabrik (fokus pada kemudahan membaca data jam, presensi cepat, transparansi gaji, dan leaderboard).
* **Harmoni Warna:** Transisi dari tema hijau sebelumnya digantikan oleh spektrum **Blue & Sky Blue** (Tailwind `blue` & `sky`) yang tetap mempertahankan kontras tinggi dan kesan bersih/segar (es kristal).

---

## 2. Palet Warna (Color Palette)

### 2.1 Primary & Accent (Blue Ice Spectrum)
Semua elemen yang sebelumnya menggunakan warna hijau (tombol aksi, progress bar, badge shift aktif, status menu) dialihkan ke palet ini:

* **Primary Base:** `#2563EB` (Blue 600) – Tombol aksi utama (CTA), tombol submit/absen, state aktif.
* **Primary Hover / Active:** `#1D4ED8` (Blue 700) – Status interaksi hover pada tombol dan icon penting.
* **Primary Surface / Tint:** `#EFF6FF` (Blue 50) – Background menu aktif di sidebar, background container banner shift.
* **Primary Subtle Border:** `#BFDBFE` (Blue 200) – Border tipis untuk badge atau banner bertema biru.
* **Primary Text Accent:** `#1E40AF` (Blue 800) – Teks di dalam badge/chip biru agar mudah dibaca (WCAG AA compliant).

### 2.2 Secondary & Info Accent (Sky Blue)
* **Secondary Light Tint:** `#E0F2FE` (Sky 100) – Background badge status seperti *"Sudah masuk"*.
* **Secondary Text:** `#0284C7` (Sky 600) / `#0369A1` (Sky 700) – Teks status informatif.

### 2.3 Neutral Colors (Cool Slate Base)
* **Canvas / App Background:** `#F8FAFC` (Slate 50) – Latar belakang utama dashboard.
* **Card & Sidebar Surface:** `#FFFFFF` – Latar kartu dan panel navigasi.
* **Borders & Dividers:** `#E2E8F0` (Slate 200) – Pemisah tabel dan border kartu.
* **Camera / Media Placeholder Box:** `#F1F5F9` (Slate 100) – Area frame selfie presensi.

### 2.4 Typography Colors
* **Display / Headings / Nilai Poin:** `#0F172A` (Slate 900) – Jam digital (`18.51.53`), judul halo, total nominal gaji.
* **Body Text:** `#334155` (Slate 700) – Teks paragraf, label menu navigasi.
* **Muted / Subtitle:** `#64748B` (Slate 500) – Penunjuk zona waktu (WITA), subjudul, teks tanggal.
* **Disabled / Placeholder Text:** `#94A3B8` (Slate 400).

### 2.5 Semantic Colors
* **Warning / Trophy Accent:** `#D97706` (Amber 600) / `#F59E0B` (Amber 500) – Icon piala karyawan terbaik & poin reward.
* **Negative / Deduction:** `#EF4444` (Red 500) – Nilai potongan payroll.
* **Neutral Off-day / Libur:** `#F1F5F9` (Slate 100) untuk background dan `#64748B` (Slate 500) untuk teks.

---

## 3. Tipografi (Typography)

Rekomendasi jenis huruf: **Plus Jakarta Sans**, **Inter**, atau **Geist Sans**.

| Level | Size | Weight | Line Height | Contoh Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Display Clock** | 40px – 48px | 800 (Extra Bold) | 1.1 | Jam digital presensi (`18.51.53`) |
| **Heading 1** | 24px – 28px | 700 (Bold) | 1.2 | `Halo, Andi` |
| **Heading 2** | 18px – 20px | 700 (Bold) | 1.3 | Judul kartu (`Presensi hari ini`, `Estimasi gaji`) |
| **Statistic Large** | 28px – 32px | 700 (Bold) | 1.2 | Nilai poin (`270`), Angka total gaji |
| **Body Bold / Semibold**| 14px – 15px | 600 (Semi Bold) | 1.5 | Label tombol aksi, Header tabel |
| **Body Regular** | 14px | 400 (Regular) | 1.5 | Teks deskripsi motivasi, baris rincian slip |
| **Caption / Badge** | 11px – 12px | 500 (Medium) | 1.4 | Tag Shift, Zona waktu (`WITA`), Status badge |

---

## 4. Spacing, Radius, & Shadows

* **Border Radius:**
  * Kontainer Kartu & Frame: `16px` (`rounded-2xl`).
  * Tombol & Field Input: `8px` (`rounded-lg`).
  * Badge & Status Chips: `9999px` (`rounded-full`) atau `6px` (`rounded-md`).
* **Shadows:**
  * Card Default: `0 1px 2px 0 rgb(0 0 0 / 0.05)` dipadukan dengan border `1px solid #E2E8F0`.
  * Interactive Hover: `0 4px 6px -1px rgb(37 99 235 / 0.1)`.
* **Grid & Layout Gap:**
  * Gap antar kartu utama: `20px` – `24px` (`gap-5` sampai `gap-6`).
  * Padding internal kartu: `20px` – `24px`.

---

## 5. Komponen Antarmuka (Updated to Blue Theme)

### 5.1 Sidebar Navigasi
* **Brand Header:**
  * Icon es kristal / snowflake beraksen warna biru (`text-blue-600` / `#2563EB`).
  * Nama aplikasi: `Premium Es Kristal` dengan subjudul kecil `ABSENSI & PAYROLL`.
* **Active Navigation Item:**
  * Latar belakang: `#EFF6FF` (`bg-blue-50`).
  * Warna icon dan teks: `#1D4ED8` (`text-blue-700 font-semibold`).
  * Border indikator kiri (opsional): `3px solid #2563EB`.
* **Footer Sidebar:**
  * Indikator status operasional: Dot biru muda aktif dengan teks `Operasional 24 jam WITA`.
  * Profil user mini: Avatar inisial dengan badge background `#DBEAFE` dan teks `#1E40AF`.

### 5.2 Header / Topbar
* **Breadcrumbs:** `Workspace > Dashboard karyawan` (`text-slate-500` dengan link aktif `text-slate-800`).
* **Badges:** Chip status data contoh dan tombol kalender ringkas berlatar putih dengan border slate.

### 5.3 Kartu Presensi Utama (Main Attendance Card)
* **Header Waktu:** Angka digital ekstra besar `18.51.53` warna `#0F172A`, badge `WITA` di samping.
* **Badge Status:** Label `Sudah masuk` menggunakan badge berlatar `#E0F2FE` (Sky 100) dan teks `#0369A1` (Sky 700).
* **Banner Shift Aktif:**
  * Background: `#EFF6FF` (`bg-blue-50`), border `#DBEAFE` (`border-blue-100`).
  * Teks & Icon: Jam dan nama shift berwarna `#1E40AF` (`text-blue-800`).
* **Viewport Kamera Presensi:**
  * Background `#F8FAFC`, border dashed/solid `#CBD5E1`.
  * Tombol interaktif: `Aktifkan kamera` (warna netral dengan border halus).
* **Tombol Aksi Utama:**
  * Tombol **Periksa lokasi**: Tombol outline putih, border `#CBD5E1`, hover `#F8FAFC`.
  * Tombol **Absen pulang**: Tombol solid warna `#2563EB` (`bg-blue-600`), hover `#1D4ED8` (`hover:bg-blue-700`), teks putih.

### 5.4 Kartu Metrik Kanan

1. **Poin Kehadiran:**
   * Icon piala warna emas/amber `#D97706`.
   * Nilai poin: `270 / 900 poin`.
   * **Progress Bar:** Background lintasan `#E2E8F0`, indikator progress aktif berwarna biru solid `#2563EB` (`bg-blue-600`).
   * Sub-keterangan: "Reward saat ini Rp 0 | 230 poin menuju Rp100.000".

2. **Estimasi Gaji:**
   * Breakdown baris transparan: Gaji harian berjalan, reward poin (`+ Rp 0`), potongan (`- Rp 0` warna merah).
   * Nilai total akhir dicetak tebal (`text-slate-900 font-bold text-xl`).

3. **Karyawan Terbaik Bulan Ini:**
   * Avatar badge: Lingkaran berlatar `#DBEAFE` dengan inisial nama warna `#1E40AF`.
   * Nama dan peran divisi (`Karyawan - Produksi`).
   * Poin sorotan di sebelah kanan: `270 poin`.

### 5.5 Tabel / Grid Jadwal Mingguan
* Grid 7 hari: Header hari (Senin - Minggu) dengan latar abu-abu lembut `#F8FAFC`.
* **Badge Hari Kerja Aktif (Shift 1):**
  * Background: `#EFF6FF` (`bg-blue-50`).
  * Teks: `#1D4ED8` (`text-blue-700 font-semibold`).
  * Jam kerja: `08.00 – 17.00`.
* **Badge Hari Libur:**
  * Background: `#F1F5F9` (`bg-slate-100`).
  * Teks: `#64748B` (`text-slate-500`).
  * Label: `Libur`.

---

## 6. Contoh Utility Classes (Tailwind CSS v3 / v4)

```css
/* Card Container */
.card-container {
  @apply bg-white rounded-2xl border border-slate-200 p-5 md:p-6 shadow-sm;
}

/* Primary Button (Absen / Aksi Utama) */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2;
}

/* Outline Action Button (Periksa Lokasi) */
.btn-outline {
  @apply bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2;
}

/* Shift Badge (Biru Es Senada) */
.badge-shift {
  @apply bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-2.5 py-1 rounded-md inline-flex items-center gap-1.5;
}

/* Nav Item Aktif */
.nav-item-active {
  @apply bg-blue-50 text-blue-700 font-semibold rounded-xl flex items-center gap-3 px-4 py-3;
}

/* Linear Progress Bar Indicator */
.progress-bar-fill {
  @apply bg-blue-600 h-2 rounded-full transition-all duration-300;
}
```