<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import { 
    attendanceRecords, 
    employees, 
    addAttendanceRecord, 
    deleteAttendanceRecord,
    createSampleSelfie
} from '@/stores/appState.js';

const searchQuery = ref('');
const selectedDivision = ref('Semua divisi');
const selectedShift = ref('Semua shift');
const divisions = ['Semua divisi', 'Produksi', 'Kasir', 'Supervisor', 'Driver'];
const shiftsList = ['Semua shift', 'Shift 1', 'Shift 2', 'Shift 3'];

// Dynamic metrics computed from real reactive attendance records
const countHadir = computed(() => attendanceRecords.value.filter(r => r.status === 'Tepat waktu' || r.status === 'Terlambat').length);
const countTerlambat = computed(() => attendanceRecords.value.filter(r => r.status === 'Terlambat').length);
const countIzinSakit = computed(() => attendanceRecords.value.filter(r => r.status.includes('Izin') || r.status.includes('Sakit') || r.status === 'Cuti').length);
const countAlpa = computed(() => attendanceRecords.value.filter(r => r.status === 'Alpa').length);

const metrics = computed(() => [
    { title: 'Karyawan hadir', value: countHadir.value, sub: 'Hari ini', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Terlambat', value: countTerlambat.value, sub: 'Seluruh shift', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-amber-50', text: 'text-amber-500' },
    { title: 'Izin / sakit', value: countIzinSakit.value, sub: 'Status manual admin', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', bg: 'bg-sky-50', text: 'text-sky-500' },
    { title: 'Alpa', value: countAlpa.value, sub: 'Upah hangus - denda Rp100.000', icon: 'M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6h12a6 6 0 00-6-6zM21 12h-6', bg: 'bg-rose-50', text: 'text-rose-500' },
]);

// Modals
const showModal = ref(false);
const showDeleteModal = ref(false);
const showPhotoModal = ref(false);
const selectedPhotoRecord = ref(null);
const recordToDelete = ref(null);

// Toast notification
const toastMessage = ref('');
const showToast = ref(false);
const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3500);
};

const statuses = ['Tepat waktu', 'Terlambat', 'Sakit', 'Izin disetujui', 'Cuti', 'Alpa'];

const form = ref({
    employeeId: '',
    shift: 'Shift 1',
    date: new Date().toISOString().split('T')[0],
    timeIn: '08:00',
    timeOut: '-',
    status: 'Tepat waktu',
    notes: '',
    attachmentUrl: null,
});

const openAddModal = () => {
    form.value = {
        employeeId: employees.value[0]?.id || '',
        shift: 'Shift 1',
        date: new Date().toISOString().split('T')[0],
        timeIn: '07:50',
        timeOut: '-',
        status: 'Tepat waktu',
        notes: '',
        attachmentUrl: null,
    };
    showModal.value = true;
};

const openPhotoModal = (rec) => {
    selectedPhotoRecord.value = rec;
    showPhotoModal.value = true;
};

const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            form.value.attachmentUrl = event.target.result;
        };
        reader.readAsDataURL(file);
    }
};

const submitRecord = () => {
    const emp = employees.value.find(e => e.id === form.value.employeeId);
    if (!emp) {
        alert('Pilih karyawan terlebih dahulu!');
        return;
    }

    // Points calculation based on status
    let points = '+30';
    if (form.value.status === 'Terlambat') {
        points = '+20';
    } else if (['Sakit', 'Izin disetujui', 'Cuti'].includes(form.value.status)) {
        points = '-';
    } else if (form.value.status === 'Alpa') {
        points = '0';
    }

    // Generate selfie photo or use uploaded image
    const photo = form.value.attachmentUrl || (['Sakit', 'Izin disetujui', 'Cuti', 'Alpa'].includes(form.value.status) ? null : createSampleSelfie(emp.name, form.value.timeIn));

    addAttendanceRecord({
        employeeId: emp.id,
        name: emp.name,
        division: emp.division,
        shift: form.value.shift,
        date: form.value.date,
        timeIn: ['Sakit', 'Izin disetujui', 'Cuti', 'Alpa'].includes(form.value.status) ? '-' : form.value.timeIn,
        timeOut: form.value.timeOut || '-',
        status: form.value.status,
        points,
        photo,
        lat: 0.539716,
        lng: 123.058278,
        distanceMeters: 8,
        notes: form.value.notes || 'Dicatat manual oleh admin',
        attachment: form.value.attachmentUrl,
    });

    triggerToast(`Absensi manual untuk ${emp.name} berhasil disimpan!`);
    showModal.value = false;
};

const confirmDelete = (rec) => {
    recordToDelete.value = rec;
    showDeleteModal.value = true;
};

const executeDelete = () => {
    if (recordToDelete.value) {
        const name = recordToDelete.value.name;
        deleteAttendanceRecord(recordToDelete.value.id);
        triggerToast(`Catatan absensi ${name} berhasil dihapus. Karyawan kini dapat melakukan absensi ulang.`);
        showDeleteModal.value = false;
        recordToDelete.value = null;
    }
};

const filteredRecords = computed(() => {
    return attendanceRecords.value.filter(att => {
        const matchName = att.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          att.id.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          (att.employeeId && att.employeeId.toLowerCase().includes(searchQuery.value.toLowerCase()));
        const matchDiv = selectedDivision.value === 'Semua divisi' || att.division === selectedDivision.value;
        const matchShift = selectedShift.value === 'Semua shift' || att.shift === selectedShift.value;
        return matchName && matchDiv && matchShift;
    });
});

// Pagination: 6 data per halaman
const currentPage = ref(1);
const pageSize = 6;
const totalPages = computed(() => Math.ceil(filteredRecords.value.length / pageSize) || 1);
const paginatedRecords = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredRecords.value.slice(start, start + pageSize);
});

watch([searchQuery, selectedDivision, selectedShift], () => {
    currentPage.value = 1;
});

const exportAttendanceCSV = () => {
    const headers = ['ID,EmployeeID,Nama,Divisi,Shift,Tanggal,Jam Masuk,Jam Pulang,Status,Poin,Catatan'];
    const rows = filteredRecords.value.map(r => 
        `"${r.id}","${r.employeeId || ''}","${r.name}","${r.division}","${r.shift}","${r.date || ''}","${r.timeIn}","${r.timeOut || '-'}","${r.status}","${r.points}","${r.notes || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'rekap_absensi_gorontalo.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Rekap absensi berhasil diekspor ke rekap_absensi_gorontalo.csv');
};
</script>

<template>
    <Head title="Rekap Absensi" />

    <div class="p-8 max-w-[1600px] mx-auto w-full space-y-6">
            
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Rekap absensi</h1>
                    <p class="text-slate-500 mt-1">Pantau kehadiran real-time, verifikasi bukti foto selfie, dan kelola status absensi karyawan.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                        Catat absensi manual
                    </button>
                </div>
            </div>

            <!-- Metrics Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div v-for="metric in metrics" :key="metric.title" class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div class="flex items-start justify-between mb-4">
                        <p class="text-[13px] font-semibold text-slate-600">{{ metric.title }}</p>
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center" :class="metric.bg">
                            <svg class="w-4 h-4" :class="metric.text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="metric.icon"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <span class="text-4xl font-extrabold text-slate-900 block mb-1">{{ metric.value }}</span>
                        <span class="text-[11px] font-medium text-slate-500">{{ metric.sub }}</span>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Absensi hari ini</h3>
                        <p class="text-xs text-slate-500 mt-1">{{ filteredRecords.length }} karyawan tercatat dalam sistem</p>
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
                        <div class="relative inline-block">
                            <select v-model="selectedShift" 
                                class="appearance-none pl-3.5 pr-10 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer transition-all">
                                <option v-for="sh in shiftsList" :key="sh" :value="sh">{{ sh }}</option>
                            </select>
                            <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </div>
                        </div>
                        <button @click="exportAttendanceCSV" title="Ekspor data ke CSV" class="h-[34px] px-3 flex items-center justify-center border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white text-slate-600 transition-colors shadow-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
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
                                <th class="px-6 py-4 font-semibold">Jam pulang</th>
                                <th class="px-6 py-4 font-semibold text-center">Status</th>
                                <th class="px-6 py-4 font-semibold text-center">Bukti foto</th>
                                <th class="px-6 py-4 font-semibold text-right">Poin</th>
                                <th class="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="att in paginatedRecords" :key="att.id" class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                                            {{ att.name.split(' ').map(n => n[0]).join('') }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-900 text-sm">{{ att.name }}</p>
                                            <p class="text-[11px] text-slate-400 mt-0.5">{{ att.employeeId || att.id }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-[13px] text-slate-600">{{ att.division }}</td>
                                <td class="px-6 py-4">
                                    <span class="text-xs font-semibold text-slate-700">{{ att.shift }}</span>
                                </td>
                                <td class="px-6 py-4 text-[13px] text-slate-600 font-medium">
                                    {{ att.timeIn }} <span v-if="att.timeIn && att.timeIn !== '-'" class="text-[10px] text-slate-400 font-normal">WITA</span>
                                </td>
                                <td class="px-6 py-4 text-[13px] text-slate-600 font-medium">
                                    {{ att.timeOut || '-' }} <span v-if="att.timeOut && att.timeOut !== '-'" class="text-[10px] text-slate-400 font-normal">WITA</span>
                                </td>
                                <td class="px-6 py-4 text-center">
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border"
                                        :class="{
                                            'bg-emerald-50 text-emerald-600 border-emerald-100': att.status === 'Tepat waktu',
                                            'bg-amber-50 text-amber-600 border-amber-100': att.status === 'Terlambat',
                                            'bg-sky-50 text-sky-600 border-sky-100': att.status === 'Izin disetujui' || att.status === 'Izin',
                                            'bg-indigo-50 text-indigo-600 border-indigo-100': att.status === 'Sakit' || att.status === 'Cuti',
                                            'bg-rose-50 text-rose-600 border-rose-100': att.status === 'Alpa',
                                        }">
                                        <svg v-if="att.status === 'Tepat waktu'" class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
                                        <svg v-if="att.status === 'Terlambat'" class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        <svg v-if="att.status.includes('Izin') || att.status === 'Sakit'" class="w-3 h-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path></svg>
                                        {{ att.status }}
                                    </span>
                                </td>
                                <!-- Bukti Foto Column -->
                                <td class="px-6 py-4 text-center">
                                    <button v-if="att.photo || att.attachment" @click="openPhotoModal(att)" 
                                        class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 rounded-lg transition-colors shadow-2xs">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        <span>Lihat Foto</span>
                                    </button>
                                    <span v-else class="text-xs text-slate-400 italic">Tidak ada foto</span>
                                </td>
                                <td class="px-6 py-4 text-[13px] font-bold text-slate-700 text-right">{{ att.points }}</td>
                                <td class="px-6 py-4 text-right">
                                    <button @click="confirmDelete(att)" class="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50" title="Hapus Catatan (Karyawan dapat absen ulang)">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredRecords.length === 0">
                                <td colspan="9" class="px-6 py-12 text-center text-slate-400 text-xs">
                                    Tidak ada data absensi yang sesuai dengan kriteria pencarian.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Table Footer (Pagination 6 data per halaman) -->
                <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
                    <span class="text-xs text-slate-500">
                        Menampilkan 
                        <span class="font-semibold text-slate-700">{{ filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}</span> - 
                        <span class="font-semibold text-slate-700">{{ Math.min(currentPage * pageSize, filteredRecords.length) }}</span> 
                        dari <span class="font-semibold text-slate-700">{{ filteredRecords.length }}</span> absensi tercatat
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
            
        </div>

        <!-- Toast Notification -->
        <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce-subtle">
            <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="text-sm font-medium">{{ toastMessage }}</span>
        </div>

        <!-- Bukti Foto Modal (Lightbox) -->
        <div v-if="showPhotoModal && selectedPhotoRecord" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                            <span>Verifikasi Bukti Foto Absen</span>
                            <span class="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">GPS Valid</span>
                        </h3>
                        <p class="text-xs text-slate-500 mt-0.5">{{ selectedPhotoRecord.name }} • {{ selectedPhotoRecord.division }} ({{ selectedPhotoRecord.shift }})</p>
                    </div>
                    <button @click="showPhotoModal = false" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Photo Display Container -->
                    <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner flex items-center justify-center aspect-4/3 relative">
                        <img v-if="selectedPhotoRecord.photo || selectedPhotoRecord.attachment" 
                            :src="selectedPhotoRecord.photo || selectedPhotoRecord.attachment" 
                            :alt="`Bukti Selfie ${selectedPhotoRecord.name}`" 
                            class="w-full h-full object-cover" />
                        <div v-else class="text-slate-400 text-xs text-center p-6">
                            Foto bukti tidak tersedia.
                        </div>
                    </div>

                    <!-- Details Metadata -->
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Jam & Tanggal:</span>
                            <span class="font-bold text-slate-800">{{ selectedPhotoRecord.timeIn }} WITA • {{ selectedPhotoRecord.date || '9 Oktober 2026' }}</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Status Kehadiran:</span>
                            <span class="font-bold text-blue-600">{{ selectedPhotoRecord.status }} ({{ selectedPhotoRecord.points }} poin)</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-slate-500">Jarak ke Pabrik:</span>
                            <span class="font-bold text-emerald-600">{{ selectedPhotoRecord.distanceMeters ? `${selectedPhotoRecord.distanceMeters} meter (Di dalam radius 100m)` : 'Terverifikasi dalam radius pabrik' }}</span>
                        </div>
                        <div v-if="selectedPhotoRecord.notes" class="pt-2 border-t border-slate-200/60">
                            <span class="text-slate-500 block mb-0.5">Catatan:</span>
                            <span class="text-slate-800 font-medium">{{ selectedPhotoRecord.notes }}</span>
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

        <!-- Add Manual Attendance Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Catat Absensi Manual</h3>
                        <p class="text-xs text-slate-500 mt-0.5">Input kehadiran, sakit, izin, atau alpa oleh admin.</p>
                    </div>
                    <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="p-6">
                    <form @submit.prevent="submitRecord" class="space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-600">Pilih Karyawan <span class="text-rose-500">*</span></label>
                            <div class="relative">
                                <select v-model="form.employeeId" class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer">
                                    <option v-for="emp in employees" :key="emp.id" :value="emp.id">
                                        {{ emp.name }} ({{ emp.division }} - {{ emp.id }})
                                    </option>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-slate-600">Tanggal <span class="text-rose-500">*</span></label>
                                <input v-model="form.date" type="date" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-slate-600">Shift Kerja <span class="text-rose-500">*</span></label>
                                <div class="relative">
                                    <select v-model="form.shift" class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer">
                                        <option value="Shift 1">Shift 1 (08.00 - 17.00)</option>
                                        <option value="Shift 2">Shift 2 (16.00 - 00.00)</option>
                                        <option value="Shift 3">Shift 3 (00.00 - 08.00)</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-slate-600">Status Kehadiran <span class="text-rose-500">*</span></label>
                                <div class="relative">
                                    <select v-model="form.status" class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer">
                                        <option v-for="stat in statuses" :key="stat" :value="stat">{{ stat }}</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-1.5" v-if="form.status === 'Tepat waktu' || form.status === 'Terlambat'">
                                <label class="text-xs font-semibold text-slate-600">Jam Masuk</label>
                                <input v-model="form.timeIn" type="text" placeholder="07:50" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
                            </div>
                        </div>

                        <div class="space-y-1.5" v-if="form.status !== 'Alpa'">
                            <label class="text-xs font-semibold text-slate-600">Lampirkan Bukti Foto / Surat (Opsional)</label>
                            <input type="file" accept="image/*" @change="handleFileUpload" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer">
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-600">Catatan / Keterangan</label>
                            <textarea v-model="form.notes" rows="2" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="Keterangan tambahan dari admin..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button @click="showModal = false" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors">Batal</button>
                    <button @click="submitRecord" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2">
                        Simpan Catatan
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal && recordToDelete" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div class="p-6 text-center">
                    <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 mb-1">Hapus Catatan Absensi?</h3>
                    <p class="text-xs text-slate-500 mb-4">
                        Apakah Anda yakin ingin menghapus catatan absensi untuk <strong class="text-slate-800">{{ recordToDelete.name }}</strong> ({{ recordToDelete.timeIn }} WITA)?
                    </p>
                    <div class="flex items-center justify-center gap-3">
                        <button @click="showDeleteModal = false" class="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                            Batal
                        </button>
                        <button @click="executeDelete" class="px-5 py-2 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors">
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </div>
        </div>
</template>
