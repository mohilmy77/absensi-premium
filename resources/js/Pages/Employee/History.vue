<script setup>
import { Head, Link } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import { 
    currentEmployee, 
    attendanceRecords 
} from '@/stores/appState.js';

// Filters
const selectedPeriod = ref('Semua');
const selectedStatus = ref('Semua status');
const searchQuery = ref('');

const periodOptions = ['Semua', '7 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini'];
const statusOptions = ['Semua status', 'Tepat waktu', 'Terlambat', 'Izin', 'Sakit', 'Alpa'];

// Modal Bukti Foto (Lightbox)
const showPhotoModal = ref(false);
const selectedPhotoRecord = ref(null);
const selectedPhotoType = ref('masuk'); // 'masuk' | 'pulang'

const openPhotoModal = (rec, type = 'masuk') => {
    selectedPhotoRecord.value = rec;
    selectedPhotoType.value = type;
    showPhotoModal.value = true;
};

const currentModalPhoto = computed(() => {
    if (!selectedPhotoRecord.value) return null;
    return selectedPhotoType.value === 'pulang' ? selectedPhotoRecord.value.photoOut : selectedPhotoRecord.value.photo;
});

const currentModalTime = computed(() => {
    if (!selectedPhotoRecord.value) return '-';
    return selectedPhotoType.value === 'pulang' ? selectedPhotoRecord.value.timeOut : selectedPhotoRecord.value.timeIn;
});

// Format Date Indo
const formatDateIndo = (dateStr) => {
    if (!dateStr) return 'Hari ini';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            const day = parseInt(parts[2], 10);
            const month = months[parseInt(parts[1], 10) - 1];
            const year = parts[0];
            return `${day} ${month} ${year}`;
        }
    } catch (e) {}
    return dateStr;
};

// All attendance for this logged in employee
const myAllRecords = computed(() => {
    const empId = currentEmployee.value?.id;
    if (!empId) return [];
    return attendanceRecords.value.filter(a => a.employeeId === empId || a.name === currentEmployee.value?.name);
});

// Filtered Records
const filteredRecords = computed(() => {
    const now = new Date();
    
    return myAllRecords.value.filter(rec => {
        // Status filter
        if (selectedStatus.value !== 'Semua status') {
            if (!rec.status.toLowerCase().includes(selectedStatus.value.toLowerCase())) {
                return false;
            }
        }

        // Period filter
        if (selectedPeriod.value !== 'Semua' && rec.date) {
            const recDate = new Date(rec.date);
            const diffDays = Math.floor((now - recDate) / (1000 * 60 * 60 * 24));
            
            if (selectedPeriod.value === '7 Hari Terakhir' && diffDays > 7) return false;
            if (selectedPeriod.value === '30 Hari Terakhir' && diffDays > 30) return false;
            if (selectedPeriod.value === 'Bulan Ini') {
                if (recDate.getMonth() !== now.getMonth() || recDate.getFullYear() !== now.getFullYear()) {
                    return false;
                }
            }
        }

        // Search query (date or notes)
        if (searchQuery.value.trim()) {
            const q = searchQuery.value.toLowerCase();
            const matchDate = (rec.date || '').toLowerCase().includes(q);
            const matchNotes = (rec.notes || '').toLowerCase().includes(q);
            const matchShift = (rec.shift || '').toLowerCase().includes(q);
            if (!matchDate && !matchNotes && !matchShift) return false;
        }

        return true;
    });
});

// Metrics summary for this employee
const totalHadir = computed(() => myAllRecords.value.filter(r => r.status === 'Tepat waktu' || r.status === 'Terlambat').length);
const totalTepatWaktu = computed(() => myAllRecords.value.filter(r => r.status === 'Tepat waktu').length);
const totalTerlambat = computed(() => myAllRecords.value.filter(r => r.status === 'Terlambat').length);
const totalPoin = computed(() => {
    return myAllRecords.value.reduce((acc, r) => {
        if (r.points && r.points.startsWith('+')) {
            return acc + parseInt(r.points.replace('+', ''), 10);
        }
        return acc;
    }, 0);
});

// Pagination (6 data per halaman sesuai standar revisi 6)
const currentPage = ref(1);
const pageSize = 6;
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize) || 1);
const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredRecords.value.slice(start, start + pageSize);
});

watch([selectedPeriod, selectedStatus, searchQuery], () => {
    currentPage.value = 1;
});
</script>

<template>
    <Head title="Riwayat Presensi - Premium Es Kristal" />

    <div class="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Riwayat Presensi</h1>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">
                    Arsip lengkap catatan absensi masuk, pulang, dan perolehan poin Anda.
                </p>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200/80">
                    {{ currentEmployee.name }} • {{ currentEmployee.id }}
                </span>
                <Link href="/employee/attendance" class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                    <span>Presensi Hari Ini</span>
                </Link>
            </div>
        </div>

        <!-- 4 Summary Metric Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span class="text-xs text-slate-500 font-medium">Total Kehadiran</span>
                <div class="flex items-baseline gap-1 mt-2">
                    <span class="text-2xl sm:text-3xl font-black text-slate-900">{{ totalHadir }}</span>
                    <span class="text-xs text-slate-400">hari</span>
                </div>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span class="text-xs text-slate-500 font-medium">Tepat Waktu</span>
                <div class="flex items-baseline gap-1 mt-2">
                    <span class="text-2xl sm:text-3xl font-black text-emerald-600">{{ totalTepatWaktu }}</span>
                    <span class="text-xs text-slate-400">kali</span>
                </div>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span class="text-xs text-slate-500 font-medium">Terlambat</span>
                <div class="flex items-baseline gap-1 mt-2">
                    <span class="text-2xl sm:text-3xl font-black text-amber-500">{{ totalTerlambat }}</span>
                    <span class="text-xs text-slate-400">kali</span>
                </div>
            </div>
            <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <span class="text-xs text-slate-500 font-medium">Akumulasi Poin</span>
                <div class="flex items-baseline gap-1 mt-2">
                    <span class="text-2xl sm:text-3xl font-black text-blue-600">+{{ totalPoin }}</span>
                    <span class="text-xs text-slate-400">poin</span>
                </div>
            </div>
        </div>

        <!-- Main Content Table Card -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            
            <!-- Filter Bar -->
            <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                <div>
                    <h3 class="text-base font-bold text-slate-900">Daftar Rekap Kehadiran</h3>
                    <p class="text-xs text-slate-500 mt-0.5">{{ filteredRecords.length }} catatan ditemukan</p>
                </div>
                <div class="flex flex-wrap items-center gap-2.5">
                    
                    <!-- Search Input -->
                    <div class="relative">
                        <input v-model="searchQuery" type="text" placeholder="Cari tanggal / shift..." 
                            class="w-44 sm:w-52 pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all">
                        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>

                    <!-- Periode Dropdown -->
                    <div class="relative inline-block">
                        <select v-model="selectedPeriod" 
                            class="appearance-none pl-3.5 pr-10 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer transition-all">
                            <option v-for="p in periodOptions" :key="p" :value="p">{{ p }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>

                    <!-- Status Dropdown -->
                    <div class="relative inline-block">
                        <select v-model="selectedStatus" 
                            class="appearance-none pl-3.5 pr-10 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer transition-all">
                            <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
                        </select>
                        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs whitespace-nowrap">
                    <thead class="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                        <tr>
                            <th class="px-6 py-4">Tanggal</th>
                            <th class="px-6 py-4">Shift</th>
                            <th class="px-6 py-4">Jam Masuk</th>
                            <th class="px-6 py-4">Jam Pulang</th>
                            <th class="px-6 py-4">Status Kehadiran</th>
                            <th class="px-6 py-4 text-center">Bukti Foto</th>
                            <th class="px-6 py-4 text-right">Perolehan Poin</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                        <tr v-for="rec in paginatedRecords" :key="rec.id" class="hover:bg-slate-50/80 transition-colors">
                            <td class="px-6 py-4 font-semibold text-slate-800">
                                {{ formatDateIndo(rec.date) }}
                            </td>
                            <td class="px-6 py-4 text-slate-600 font-medium">
                                <span class="px-2.5 py-1 bg-slate-100 rounded-md font-semibold text-[11px]">{{ rec.shift }}</span>
                            </td>
                            <td class="px-6 py-4 text-slate-700 font-mono font-medium">
                                {{ rec.timeIn !== '-' ? `${rec.timeIn} WITA` : '-' }}
                            </td>
                            <td class="px-6 py-4 text-slate-700 font-mono font-medium">
                                {{ rec.timeOut && rec.timeOut !== '-' ? `${rec.timeOut} WITA` : '-' }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border"
                                    :class="{
                                        'bg-emerald-50 text-emerald-600 border-emerald-100': rec.status === 'Tepat waktu',
                                        'bg-amber-50 text-amber-600 border-amber-100': rec.status === 'Terlambat',
                                        'bg-sky-50 text-sky-600 border-sky-100': rec.status.includes('Izin') || rec.status.includes('Sakit'),
                                        'bg-rose-50 text-rose-600 border-rose-100': rec.status === 'Alpa',
                                    }">
                                    <svg v-if="rec.status === 'Tepat waktu'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                    <svg v-if="rec.status === 'Terlambat'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {{ rec.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <div class="flex items-center justify-center gap-1.5">
                                    <button v-if="rec.photo" @click="openPhotoModal(rec, 'masuk')" 
                                        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors shadow-2xs"
                                        title="Lihat foto bukti masuk">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                                        <span>Masuk</span>
                                    </button>
                                    <button v-if="rec.photoOut" @click="openPhotoModal(rec, 'pulang')" 
                                        class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors shadow-2xs"
                                        title="Lihat foto bukti pulang">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                        <span>Pulang</span>
                                    </button>
                                    <span v-if="!rec.photo && !rec.photoOut" class="text-slate-400 italic">-</span>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-right font-black text-slate-800 text-sm">
                                <span :class="rec.points && rec.points.startsWith('+') ? 'text-blue-600' : 'text-slate-400'">
                                    {{ rec.points || '-' }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="filteredRecords.length === 0">
                            <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                                Tidak ada catatan riwayat absensi yang cocok dengan kriteria filter.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Table Footer Pagination (6 items per page) -->
            <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
                <span class="text-xs text-slate-500">
                    Menampilkan 
                    <span class="font-semibold text-slate-700">{{ filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}</span> - 
                    <span class="font-semibold text-slate-700">{{ Math.min(currentPage * pageSize, filteredRecords.length) }}</span> 
                    dari <span class="font-semibold text-slate-700">{{ filteredRecords.length }}</span> catatan
                </span>
                <div class="flex items-center gap-2">
                    <button 
                        @click="currentPage > 1 && currentPage--" 
                        :disabled="currentPage <= 1"
                        class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                        :class="currentPage <= 1 ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 active:scale-95'">
                        Sebelumnya
                    </button>
                    <div class="flex items-center gap-1">
                        <button 
                            v-for="p in totalPages" 
                            :key="p" 
                            @click="currentPage = p"
                            class="w-7 h-7 text-xs rounded-lg transition-colors flex items-center justify-center"
                            :class="p === currentPage ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:bg-slate-100 font-medium'">
                            {{ p }}
                        </button>
                    </div>
                    <button 
                        @click="currentPage < totalPages && currentPage++" 
                        :disabled="currentPage >= totalPages"
                        class="px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all"
                        :class="currentPage >= totalPages ? 'text-slate-300 bg-slate-50 border-slate-100 cursor-not-allowed' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-50 active:scale-95'">
                        Berikutnya
                    </button>
                </div>
            </div>

        </div>

        <!-- Lightbox Modal Bukti Foto Selfie Karyawan -->
        <div v-if="showPhotoModal && selectedPhotoRecord" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Bukti Foto Presensi {{ selectedPhotoType === 'pulang' ? 'Pulang' : 'Masuk' }}</span>
                            <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">GPS Valid</span>
                        </h3>
                        <p class="text-xs text-slate-500 mt-0.5">{{ selectedPhotoRecord.name }} • {{ formatDateIndo(selectedPhotoRecord.date) }}</p>
                    </div>
                    <button @click="showPhotoModal = false" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div v-if="selectedPhotoRecord.photoOut || (selectedPhotoRecord.photo && selectedPhotoRecord.timeOut !== '-')" class="px-6 pt-3 bg-white">
                    <div class="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                        <button @click="selectedPhotoType = 'masuk'" 
                            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            :class="selectedPhotoType === 'masuk' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
                            <span>Foto Masuk ({{ selectedPhotoRecord.timeIn }})</span>
                        </button>
                        <button v-if="selectedPhotoRecord.photoOut" @click="selectedPhotoType = 'pulang'" 
                            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            :class="selectedPhotoType === 'pulang' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
                            <span>Foto Pulang ({{ selectedPhotoRecord.timeOut }})</span>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-4">
                    <!-- Photo Display Container -->
                    <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner flex items-center justify-center aspect-4/3 relative">
                        <img v-if="currentModalPhoto" 
                            :src="currentModalPhoto" 
                            :alt="`Foto Selfie Presensi`" 
                            class="w-full h-full object-cover" />
                        <div v-else class="text-slate-400 text-xs text-center p-6">
                            Foto bukti tidak tersedia.
                        </div>
                    </div>

                    <!-- Details Metadata -->
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Waktu & Tanggal:</span>
                            <span class="font-bold text-slate-800">
                                {{ currentModalTime }} WITA • {{ formatDateIndo(selectedPhotoRecord.date) }} ({{ selectedPhotoType === 'pulang' ? 'Presensi Pulang' : 'Presensi Datang' }})
                            </span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Status & Poin:</span>
                            <span class="font-bold text-blue-600">{{ selectedPhotoRecord.status }} ({{ selectedPhotoRecord.points }} poin)</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Titik Koordinat:</span>
                            <div class="flex items-center gap-2">
                                <span class="font-mono text-slate-700 font-semibold">{{ (selectedPhotoRecord.lat || 0.539716).toFixed(6) }}, {{ (selectedPhotoRecord.lng || 123.058278).toFixed(6) }}</span>
                                <a :href="`https://maps.google.com/?q=${selectedPhotoRecord.lat || 0.539716},${selectedPhotoRecord.lng || 123.058278}`" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline inline-flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    Buka Maps
                                </a>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Jarak ke Pabrik:</span>
                            <span class="font-bold text-emerald-600">
                                {{ selectedPhotoRecord.distanceMeters ? `${selectedPhotoRecord.distanceMeters} meter (Terverifikasi dalam radius pabrik)` : 'Terverifikasi dalam radius pabrik' }}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button @click="showPhotoModal = false" class="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">
                        Tutup
                    </button>
                </div>
            </div>
        </div>

    </div>
</template>
