<script setup>
import { Head, Link } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { attendanceRecords, employees } from '@/stores/appState.js';

const searchQuery = ref('');
const selectedDivision = ref('Semua divisi');
const divisions = ['Semua divisi', 'Produksi', 'Kasir', 'Supervisor', 'Driver'];

const recentAttendances = computed(() => attendanceRecords.value);
const activeEmployeesCount = computed(() => employees.value.filter(e => e.isActive).length);

// Dynamic Metrics from store
const countHadir = computed(() => attendanceRecords.value.filter(r => r.status === 'Tepat waktu' || r.status === 'Terlambat').length);
const countTerlambat = computed(() => attendanceRecords.value.filter(r => r.status === 'Terlambat').length);
const countIzinSakit = computed(() => attendanceRecords.value.filter(r => r.status && (r.status.includes('Izin') || r.status.includes('Sakit') || r.status === 'Cuti')).length);
const countAlpa = computed(() => attendanceRecords.value.filter(r => r.status === 'Alpa').length);

const metrics = computed(() => [
    { title: 'Karyawan hadir', value: countHadir.value, sub: 'karyawan', trend: 'Tercatat hadir hari ini', trendUp: true, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Terlambat', value: countTerlambat.value, sub: 'karyawan', trend: 'Termasuk dalam karyawan hadir', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-amber-50', text: 'text-amber-500' },
    { title: 'Izin / sakit', value: countIzinSakit.value, sub: 'karyawan', trend: 'Status izin resmi', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'bg-sky-50', text: 'text-sky-500' },
    { title: 'Alpa', value: countAlpa.value, sub: 'karyawan', trend: 'Harus ditindaklanjuti admin', icon: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6h12a6 6 0 00-6-6zM21 12h-6', bg: 'bg-rose-50', text: 'text-rose-500' },
]);

// Photo modal states
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
    if (selectedPhotoType.value === 'pulang') {
        return selectedPhotoRecord.value.photoOut || null;
    }
    return selectedPhotoRecord.value.photo || null;
});

const currentModalTime = computed(() => {
    if (!selectedPhotoRecord.value) return '-';
    if (selectedPhotoType.value === 'pulang') {
        return selectedPhotoRecord.value.timeOut || '-';
    }
    return selectedPhotoRecord.value.timeIn || '-';
});

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

const activities = computed(() => {
    return attendanceRecords.value.slice(0, 6).map(att => ({
        text: `${att.name} melakukan ${att.timeIn !== '-' ? 'absen masuk' : 'pencatatan status ' + att.status}`,
        time: att.timeIn !== '-' ? att.timeIn : '08:00',
        type: att.status === 'Tepat waktu' ? 'success' : (att.status === 'Terlambat' ? 'warning' : 'info'),
    }));
});

const filteredAttendances = computed(() => {
    return attendanceRecords.value.filter(att => {
        const matchName = att.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          att.id.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchDiv = selectedDivision.value === 'Semua divisi' || att.division === selectedDivision.value;
        return matchName && matchDiv;
    });
});

const downloadReport = () => {
    const headers = ['ID,Nama,Divisi,Shift,Jam Masuk,Status,Poin'];
    const rows = filteredAttendances.value.map(r => `"${r.id}","${r.name}","${r.division}","${r.shift}","${r.timeIn}","${r.status}","${r.points}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'laporan_dashboard_absensi.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
</script>

<template>
    <Head title="Dashboard" />

    <div class="p-8 max-w-[1600px] mx-auto w-full space-y-6">
            
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
                    <p class="text-slate-500 mt-1">Selamat datang kembali, Admin. Berikut ringkasan operasional hari ini.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button class="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                        <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        9 Oktober 2026
                    </button>
                    <button @click="downloadReport" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm active:scale-95">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Unduh laporan
                    </button>
                </div>
            </div>

            <!-- Big Banner -->
            <div class="bg-blue-600 rounded-2xl overflow-hidden relative shadow-md">
                <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579299863412-16e680a6538b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div class="absolute inset-0 bg-gradient-to-r from-blue-700/90 to-blue-500/80"></div>
                
                <div class="relative z-10 p-8 md:p-10">
                    <div class="flex items-center gap-2 text-blue-100 font-semibold text-xs tracking-wider uppercase mb-3">
                        PREMIUM ES KRISTAL
                    </div>
                    <h2 class="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">Tim yang solid, operasional yang lancar.</h2>
                    <p class="text-blue-100 mb-6 font-medium">Setiap kehadiran berarti untuk kualitas yang kita jaga.</p>
                    
                    <div class="flex flex-wrap items-center gap-3">
                        <span class="bg-white text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">Pabrik beroperasi</span>
                        <span class="bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            3 shift • 24 jam
                        </span>
                        <span class="bg-white/20 backdrop-blur border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            {{ activeEmployeesCount }} karyawan aktif
                        </span>
                    </div>
                </div>
            </div>

            <!-- Metrics Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="metric in metrics" :key="metric.title" class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div class="flex items-start justify-between mb-2">
                        <p class="text-sm font-semibold text-slate-600">{{ metric.title }}</p>
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="metric.bg">
                            <svg class="w-4 h-4" :class="metric.text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="metric.icon"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="flex items-baseline gap-1 mb-3">
                        <span class="text-3xl font-extrabold text-slate-900">{{ metric.value }}</span>
                        <span class="text-xs font-medium text-slate-500">{{ metric.sub }}</span>
                    </div>
                    <div class="text-[11px] font-medium" :class="metric.trendUp ? 'text-blue-600 flex items-center gap-1' : 'text-slate-400'">
                        <svg v-if="metric.trendUp" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                        {{ metric.trend }}
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Chart Placeholder -->
                <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div class="flex justify-between items-center mb-6">
                        <div>
                            <h3 class="text-lg font-bold text-slate-900">Tren kehadiran</h3>
                            <p class="text-xs text-slate-500 mt-1">Ringkasan kehadiran karyawan per hari</p>
                        </div>
                        <div class="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                            <button class="hover:bg-slate-200 p-0.5 rounded"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button>
                            <span>5 - 11 Okt 2026</span>
                            <button class="hover:bg-slate-200 p-0.5 rounded"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-4 text-xs font-medium text-slate-500 mb-6">
                        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded bg-blue-600"></span> Tepat waktu</div>
                        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded bg-amber-400"></span> Terlambat</div>
                        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded bg-slate-300"></span> Alpa</div>
                    </div>

                    <!-- Dummy Bar Chart -->
                    <div class="h-64 flex items-end justify-between px-2 gap-4">
                        <div v-for="day in ['Sen, 5', 'Sel, 6', 'Rab, 7', 'Kam, 8', 'Jum, 9', 'Sab, 10', 'Min, 11']" :key="day" class="flex flex-col items-center gap-2 flex-1">
                            <div class="w-full flex items-end justify-center gap-1 h-48 border-b border-slate-100 pb-2">
                                <div class="w-3 rounded-t-sm bg-blue-600" :style="{height: (Math.random() * 60 + 40) + '%'}"></div>
                                <div class="w-3 rounded-t-sm bg-amber-400" :style="{height: (Math.random() * 20 + 5) + '%'}"></div>
                                <div class="w-3 rounded-t-sm bg-slate-300" :style="{height: (Math.random() * 10) + '%'}"></div>
                            </div>
                            <span class="text-[10px] font-semibold text-slate-500" :class="day === 'Jum, 9' ? 'text-blue-600' : ''">{{ day }}</span>
                        </div>
                    </div>
                </div>

                <!-- Shift Status -->
                <div class="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-lg font-bold text-slate-900">Operasional shift</h3>
                        <a href="/admin/schedule" class="text-xs font-semibold text-blue-600 flex items-center gap-1 hover:underline">
                            Lihat jadwal
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                    </div>
                    
                    <div class="space-y-4 flex-1">
                        <!-- Shift 1 Active -->
                        <div class="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-2 font-bold text-slate-900">
                                    <svg class="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                                    Shift 1
                                </div>
                                <span class="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"><span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>Berlangsung</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mb-4">08.00 - 17.00 WITA</p>
                            <div class="flex justify-between text-[11px] font-medium mb-1.5">
                                <span class="text-slate-600">8 karyawan terjadwal</span>
                                <span class="text-slate-900 font-bold">5/8 hadir</span>
                            </div>
                            <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div class="bg-blue-500 h-full rounded-full" style="width: 62.5%"></div>
                            </div>
                        </div>

                        <!-- Shift 2 -->
                        <div class="p-4 rounded-xl border border-slate-100 bg-slate-50">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-2 font-bold text-slate-700">
                                    <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
                                    Shift 2
                                </div>
                                <span class="bg-sky-50 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-100">Berikutnya</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mb-4">16.00 - 00.00 WITA</p>
                            <div class="flex justify-between text-[11px] font-medium mb-1.5">
                                <span class="text-slate-500">2 karyawan terjadwal</span>
                                <span class="text-slate-500 font-bold">0/2 hadir</span>
                            </div>
                            <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div class="bg-slate-300 h-full rounded-full" style="width: 0%"></div>
                            </div>
                        </div>
                        
                        <!-- Shift 3 -->
                        <div class="p-4 rounded-xl border border-slate-100 bg-white opacity-60">
                            <div class="flex justify-between items-start mb-2">
                                <div class="flex items-center gap-2 font-bold text-slate-700">
                                    <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                                    Shift 3
                                </div>
                                <span class="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200">Selesai</span>
                            </div>
                            <p class="text-[11px] text-slate-500 mb-4">00.00 - 08.00 WITA</p>
                            <div class="flex justify-between text-[11px] font-medium mb-1.5">
                                <span class="text-slate-500">2 karyawan terjadwal</span>
                                <span class="text-slate-700 font-bold">2/2 hadir</span>
                            </div>
                            <div class="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div class="bg-blue-500 h-full rounded-full" style="width: 100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Table -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Absensi hari ini</h3>
                        <p class="text-xs text-slate-500 mt-1">Jumat, 9 Oktober 2026 - {{ recentAttendances.length }} karyawan terjadwal</p>
                    </div>
                    <div class="flex items-center gap-3">
                        <div class="relative">
                            <input v-model="searchQuery" type="text" placeholder="Cari nama karyawan..." 
                                class="w-60 pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 transition-all">
                            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                        <div class="relative inline-block">
                            <select v-model="selectedDivision" 
                                class="appearance-none pl-3.5 pr-10 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer transition-all">
                                <option v-for="div in divisions" :key="div" :value="div">{{ div }}</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm whitespace-nowrap">
                        <thead class="bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                            <tr>
                                <th class="px-6 py-4 font-semibold">Karyawan</th>
                                <th class="px-6 py-4 font-semibold">Divisi</th>
                                <th class="px-6 py-4 font-semibold">Shift</th>
                                <th class="px-6 py-4 font-semibold">Jam masuk</th>
                                <th class="px-6 py-4 font-semibold">Status</th>
                                <th class="px-6 py-4 font-semibold text-center">Bukti foto</th>
                                <th class="px-6 py-4 font-semibold text-right">Poin</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="att in filteredAttendances" :key="att.id" class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-3">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                            {{ att.name.split(' ').map(n => n[0]).join('') }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-900 text-[13px]">{{ att.name }}</p>
                                            <p class="text-[10px] text-slate-400">{{ att.employeeId || att.id }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-3 text-[13px] text-slate-600">{{ att.division }}</td>
                                <td class="px-6 py-3">
                                    <span class="text-xs font-semibold text-slate-700">{{ att.shift }}</span>
                                </td>
                                <td class="px-6 py-3 text-[13px] text-slate-600 font-medium">{{ att.timeIn }} <span v-if="att.timeIn !== '-'" class="text-[10px] text-slate-400 font-normal">WITA</span></td>
                                <td class="px-6 py-3">
                                    <span class="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-600 border-emerald-100': att.status === 'Tepat waktu',
                                            'bg-amber-50 text-amber-600 border-amber-100': att.status === 'Terlambat',
                                            'bg-sky-50 text-sky-600 border-sky-100': att.status.includes('Izin'),
                                            'bg-rose-50 text-rose-600 border-rose-100': att.status === 'Alpa',
                                        }">
                                        <svg v-if="att.status === 'Tepat waktu'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                        <svg v-if="att.status === 'Terlambat'" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <svg v-if="att.status.includes('Izin')" class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                                        {{ att.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-3 text-center">
                                    <div class="flex items-center justify-center gap-1.5">
                                        <button v-if="att.photo" @click="openPhotoModal(att, 'masuk')" 
                                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors shadow-2xs"
                                            title="Lihat foto bukti masuk">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                                            <span>Masuk</span>
                                        </button>
                                        <button v-if="att.photoOut" @click="openPhotoModal(att, 'pulang')" 
                                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors shadow-2xs"
                                            title="Lihat foto bukti pulang">
                                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                            <span>Pulang</span>
                                        </button>
                                        <span v-if="!att.photo && !att.photoOut" class="text-xs text-slate-400 italic">-</span>
                                    </div>
                                </td>
                                <td class="px-6 py-3 text-[13px] font-bold text-slate-700 text-right">{{ att.points }}</td>
                            </tr>
                            <tr v-if="filteredAttendances.length === 0">
                                <td colspan="7" class="px-6 py-10 text-center text-slate-400 text-xs">
                                    Tidak ada data absensi yang sesuai dengan kriteria pencarian.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-slate-50/50">
                    <span>Menampilkan {{ filteredAttendances.length }} dari {{ recentAttendances.length }} karyawan</span>
                    <Link href="/admin/manual-attendance" class="font-semibold text-blue-600 hover:underline flex items-center gap-1">
                        <span>Lihat semua di Rekap Absensi</span>
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </Link>
                </div>
            </div>

            <!-- Bottom Row -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Karyawan Terbaik -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div class="flex justify-between items-center mb-6">
                        <div class="flex items-center gap-2 font-bold text-slate-900 text-sm">
                            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            Karyawan terbaik bulan ini
                        </div>
                        <span class="text-xs text-slate-500 font-medium">Oktober 2026</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">RM</div>
                            <div>
                                <p class="text-base font-bold text-slate-900">Rahmat Malango</p>
                                <p class="text-[11px] text-slate-500 mb-1">Produksi • Kehadiran konsisten</p>
                                <span class="inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded">
                                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"></path></svg>
                                    Peringkat #1
                                </span>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-3xl font-extrabold text-blue-600 leading-none">270</p>
                            <p class="text-[11px] text-slate-400 font-medium mt-1">poin terkumpul</p>
                        </div>
                    </div>
                </div>

                <!-- Aktivitas Terbaru -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="font-bold text-slate-900 text-sm">Aktivitas terbaru</h3>
                        <span class="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded">Hari ini</span>
                    </div>
                    <div class="space-y-4">
                        <div v-for="(act, index) in activities" :key="index" class="flex items-start gap-3">
                            <div class="mt-0.5">
                                <div v-if="act.type === 'success'" class="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                                    <svg class="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <div v-else class="w-5 h-5 rounded-full bg-sky-50 flex items-center justify-center">
                                    <svg class="w-3 h-3 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                            </div>
                            <div class="flex-1 flex justify-between items-start border-b border-slate-50 pb-4">
                                <p class="text-xs text-slate-700 font-medium">{{ act.text }}</p>
                                <span class="text-[10px] text-slate-400 shrink-0">{{ act.time }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>

        <!-- Bukti Foto Modal (Lightbox) -->
        <div v-if="showPhotoModal && selectedPhotoRecord" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Verifikasi Bukti Foto Absen {{ selectedPhotoType === 'pulang' ? 'Pulang' : 'Masuk' }}</span>
                            <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">GPS Valid</span>
                        </h3>
                        <p class="text-xs text-slate-500 mt-0.5">{{ selectedPhotoRecord.name }} • {{ selectedPhotoRecord.division }} ({{ selectedPhotoRecord.shift }})</p>
                    </div>
                    <button @click="showPhotoModal = false" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <!-- Toggle Selector Masuk / Pulang if both or Pulang available -->
                <div v-if="selectedPhotoRecord.photoOut || (selectedPhotoRecord.photo && selectedPhotoRecord.timeOut !== '-')" class="px-6 pt-3 bg-white">
                    <div class="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                        <button @click="selectedPhotoType = 'masuk'" 
                            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            :class="selectedPhotoType === 'masuk' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                            <span>Foto Masuk ({{ selectedPhotoRecord.timeIn }})</span>
                        </button>
                        <button v-if="selectedPhotoRecord.photoOut" @click="selectedPhotoType = 'pulang'" 
                            class="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                            :class="selectedPhotoType === 'pulang' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            <span>Foto Pulang ({{ selectedPhotoRecord.timeOut }})</span>
                        </button>
                    </div>
                </div>

                <div class="p-6 space-y-4">
                    <!-- Photo Display Container -->
                    <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner flex items-center justify-center aspect-4/3 relative">
                        <img v-if="currentModalPhoto" 
                            :src="currentModalPhoto" 
                            :alt="`Bukti Selfie ${selectedPhotoRecord.name}`" 
                            class="w-full h-full object-cover" />
                        <div v-else class="text-slate-400 text-xs text-center p-6 flex flex-col items-center gap-2">
                            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <span>Foto bukti {{ selectedPhotoType === 'pulang' ? 'pulang' : 'masuk' }} tidak tersedia.</span>
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
                            <span class="text-slate-500">Status Kehadiran:</span>
                            <span class="font-bold text-blue-600">{{ selectedPhotoRecord.status }} ({{ selectedPhotoRecord.points }} poin)</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Titik Koordinat:</span>
                            <div class="flex items-center gap-2">
                                <span class="font-mono text-slate-700 font-semibold">{{ Number(selectedPhotoRecord.lat || 0.539716).toFixed(6) }}, {{ Number(selectedPhotoRecord.lng || 123.058278).toFixed(6) }}</span>
                                <a :href="`https://maps.google.com/?q=${selectedPhotoRecord.lat || 0.539716},${selectedPhotoRecord.lng || 123.058278}`" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 text-[11px] font-semibold underline inline-flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                    Buka Maps
                                </a>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Jarak ke Pabrik:</span>
                            <span class="font-bold text-emerald-600">
                                {{ selectedPhotoRecord.distanceMeters ? `${selectedPhotoRecord.distanceMeters} meter (Di dalam radius 100m)` : 'Terverifikasi dalam radius pabrik' }}
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
</template>
