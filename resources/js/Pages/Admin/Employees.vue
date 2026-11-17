<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import { 
    employees, 
    addEmployee, 
    updateEmployee, 
    deleteEmployee, 
    toggleEmployeeStatus,
    generateNextEmployeeId 
} from '@/stores/appState.js';

const searchQuery = ref('');
const selectedDivision = ref('Semua divisi');

// Dynamic metrics based on actual reactive employees data
const totalCount = computed(() => employees.value.length);
const activeCount = computed(() => employees.value.filter(e => e.isActive).length);
const divisionCount = computed(() => new Set(employees.value.map(e => e.division)).size);
const averageWage = computed(() => {
    if (!employees.value.length) return 0;
    const sum = employees.value.reduce((acc, curr) => acc + (Number(curr.wage) || 0), 0);
    return Math.round(sum / employees.value.length / 1000);
});

const metrics = computed(() => [
    { title: 'Total karyawan', value: totalCount.value, sub: 'orang', trend: 'Seluruh data karyawan', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Karyawan aktif', value: activeCount.value, sub: 'orang', trend: 'Terdaftar dalam operasional', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', bg: 'bg-sky-50', text: 'text-sky-600' },
    { title: 'Divisi', value: divisionCount.value, sub: 'divisi', trend: 'Produksi hingga Driver', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', bg: 'bg-indigo-50', text: 'text-indigo-500' },
    { title: 'Upah rata-rata', value: averageWage.value, sub: 'rb', trend: 'Rupiah per hari', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z', bg: 'bg-amber-50', text: 'text-amber-500' },
]);

const divisions = ['Produksi', 'Kasir', 'Supervisor', 'Driver'];
const divisionFilterList = ['Semua divisi', 'Produksi', 'Kasir', 'Supervisor', 'Driver'];
const statuses = ['Baru', 'Lama > 1 tahun'];

const filteredEmployees = computed(() => {
    return employees.value.filter(emp => {
        const matchName = emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchDiv = selectedDivision.value === 'Semua divisi' || emp.division === selectedDivision.value;
        return matchName && matchDiv;
    });
});

// Pagination: 6 data per halaman
const currentPage = ref(1);
const pageSize = 6;
const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / pageSize) || 1);
const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * pageSize;
    return filteredEmployees.value.slice(start, start + pageSize);
});

watch([searchQuery, selectedDivision], () => {
    currentPage.value = 1;
});

// Modals state
const showModal = ref(false);
const showDeleteModal = ref(false);
const editingEmployee = ref(null);
const employeeToDelete = ref(null);

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

const form = ref({
    nik: '',
    name: '',
    division: 'Produksi',
    phone: '',
    status: 'Baru',
    wage: 50000,
});

const openAddModal = () => {
    editingEmployee.value = null;
    form.value = {
        nik: generateNextEmployeeId('Produksi'),
        name: '',
        division: 'Produksi',
        phone: '',
        status: 'Baru',
        wage: 50000,
    };
    showModal.value = true;
};

const onDivisionChange = () => {
    if (!editingEmployee.value) {
        form.value.nik = generateNextEmployeeId(form.value.division);
    }
};

const openEditModal = (emp) => {
    editingEmployee.value = emp;
    form.value = { 
        nik: emp.id, 
        name: emp.name, 
        division: emp.division, 
        phone: emp.phone || '081234567890',
        status: emp.statusKerja, 
        wage: emp.wage 
    };
    showModal.value = true;
};

const saveEmployee = () => {
    if (!form.value.name.trim()) {
        alert('Nama karyawan wajib diisi!');
        return;
    }

    if (editingEmployee.value) {
        updateEmployee(editingEmployee.value.id, {
            name: form.value.name,
            division: form.value.division,
            phone: form.value.phone,
            statusKerja: form.value.status,
            wage: form.value.wage,
        });
        triggerToast(`Data karyawan ${form.value.name} berhasil diperbarui!`);
    } else {
        const created = addEmployee({
            id: form.value.nik,
            name: form.value.name,
            division: form.value.division,
            phone: form.value.phone,
            statusKerja: form.value.status,
            wage: form.value.wage,
        });
        triggerToast(`Karyawan baru ${created.name} (${created.id}) berhasil ditambahkan!`);
    }
    showModal.value = false;
};

const confirmDelete = (emp) => {
    employeeToDelete.value = emp;
    showDeleteModal.value = true;
};

const executeDelete = () => {
    if (employeeToDelete.value) {
        const name = employeeToDelete.value.name;
        deleteEmployee(employeeToDelete.value.id);
        triggerToast(`Data karyawan ${name} berhasil dihapus.`);
        showDeleteModal.value = false;
        employeeToDelete.value = null;
    }
};

const toggleStatus = (emp) => {
    toggleEmployeeStatus(emp.id);
    triggerToast(`Status ${emp.name} diubah menjadi ${emp.isActive ? 'Aktif' : 'Nonaktif'}.`);
};

const resetPassword = (emp) => {
    triggerToast(`Password untuk ${emp.name} berhasil direset ke: 123456`);
};
</script>

<template>
    <Head title="Data Karyawan" />

    <div class="p-8 max-w-[1600px] mx-auto w-full space-y-6">
            
            <!-- Header Section -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Data karyawan</h1>
                    <p class="text-slate-500 mt-1">Kelola tim, divisi, dan informasi penggajian karyawan.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="openAddModal" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
                        Tambah karyawan
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
                        <div class="flex items-baseline gap-1 mb-1">
                            <span class="text-4xl font-extrabold text-slate-900">{{ metric.value }}</span>
                            <span class="text-sm font-semibold text-slate-900">{{ metric.sub }}</span>
                        </div>
                        <span class="text-[11px] font-medium text-slate-500">{{ metric.trend }}</span>
                    </div>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Daftar karyawan</h3>
                        <p class="text-xs text-slate-500 mt-1">{{ filteredEmployees.length }} karyawan terdaftar</p>
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
                                <option v-for="div in divisionFilterList" :key="div" :value="div">{{ div }}</option>
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
                                <th class="px-6 py-4 font-semibold">Masa kerja</th>
                                <th class="px-6 py-4 font-semibold">Upah harian</th>
                                <th class="px-6 py-4 font-semibold text-center">Status</th>
                                <th class="px-6 py-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="emp in paginatedEmployees" :key="emp.id" class="hover:bg-slate-50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                                            {{ emp.name.split(' ').map(n => n[0]).join('') }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-900 text-[13px]">{{ emp.name }}</p>
                                            <p class="text-[11px] text-slate-400 mt-0.5">{{ emp.id }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 text-[13px] font-medium text-slate-600">{{ emp.division }}</td>
                                <td class="px-6 py-4 text-[13px] text-slate-500">{{ emp.statusKerja }}</td>
                                <td class="px-6 py-4 text-[13px] font-medium text-slate-700">Rp {{ emp.wage.toLocaleString('id-ID') }}</td>
                                <td class="px-6 py-4 text-center">
                                    <span class="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold border"
                                        :class="emp.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'">
                                        {{ emp.isActive ? 'Aktif' : 'Nonaktif' }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right space-x-1">
                                    <button @click="openEditModal(emp)" class="p-1.5 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50" title="Edit Data">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                    </button>
                                    <button @click="resetPassword(emp)" class="p-1.5 text-slate-400 hover:text-amber-600 transition-colors rounded-lg hover:bg-amber-50" title="Reset Password (123456)">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                                    </button>
                                    <button @click="toggleStatus(emp)" class="p-1.5 transition-colors rounded-lg" :class="emp.isActive ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'" :title="emp.isActive ? 'Nonaktifkan Karyawan' : 'Aktifkan Karyawan'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                    </button>
                                    <button @click="confirmDelete(emp)" class="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50" title="Hapus Karyawan">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="filteredEmployees.length === 0">
                                <td colspan="6" class="px-6 py-12 text-center text-slate-400 text-xs">
                                    Tidak ada data karyawan yang sesuai dengan kriteria pencarian.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <!-- Table Footer (Pagination 6 data per halaman) -->
                <div class="p-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
                    <span class="text-xs text-slate-500">
                        Menampilkan 
                        <span class="font-semibold text-slate-700">{{ filteredEmployees.length === 0 ? 0 : (currentPage - 1) * pageSize + 1 }}</span> - 
                        <span class="font-semibold text-slate-700">{{ Math.min(currentPage * pageSize, filteredEmployees.length) }}</span> 
                        dari <span class="font-semibold text-slate-700">{{ filteredEmployees.length }}</span> karyawan
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

        <!-- Add/Edit Employee Modal -->
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden transform transition-all">
                <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">{{ editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru' }}</h3>
                        <p class="text-xs text-slate-500 mt-0.5">Kelola identitas, divisi, dan status upah.</p>
                    </div>
                    <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div class="p-6">
                    <form @submit.prevent="saveEmployee" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-slate-600 flex items-center justify-between">
                                    <span>ID / NIK <span class="text-rose-500">*</span></span>
                                    <span v-if="!editingEmployee" class="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Otomatis Divisi</span>
                                </label>
                                <input v-model="form.nik" type="text" :readonly="!editingEmployee" 
                                    class="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                                    :class="!editingEmployee ? 'bg-slate-100 cursor-not-allowed text-slate-600 font-bold' : 'bg-slate-50'" 
                                    placeholder="Contoh: PRD-001">
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-slate-600">No. HP / WhatsApp <span class="text-rose-500">*</span></label>
                                <input v-model="form.phone" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="0812...">
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-600">Nama Lengkap <span class="text-rose-500">*</span></label>
                            <input v-model="form.name" type="text" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder-slate-400" placeholder="Nama lengkap karyawan">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-slate-600">Divisi <span class="text-rose-500">*</span></label>
                                <div class="relative">
                                    <select v-model="form.division" @change="onDivisionChange" class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer">
                                        <option v-for="div in divisions" :key="div" :value="div">{{ div }}</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                            <div class="space-y-1.5">
                                <label class="text-xs font-semibold text-slate-600">Masa Kerja <span class="text-rose-500">*</span></label>
                                <div class="relative">
                                    <select v-model="form.status" class="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-10 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer">
                                        <option v-for="stat in statuses" :key="stat" :value="stat">{{ stat }}</option>
                                    </select>
                                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-600">Upah Pokok Harian (Rp)</label>
                            <input v-model="form.wage" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" placeholder="50000">
                            <p class="text-[10px] text-slate-500 mt-1">* Sesuaikan jika upah berbeda dari standar (Rp 50.000).</p>
                        </div>
                    </form>
                </div>
                <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button @click="showModal = false" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors">Batal</button>
                    <button @click="saveEmployee" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 flex items-center gap-2">
                        Simpan Data
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div class="p-6 text-center">
                    <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </div>
                    <h3 class="text-lg font-bold text-slate-900 mb-1">Hapus Data Karyawan?</h3>
                    <p class="text-xs text-slate-500 mb-4">
                        Apakah Anda yakin ingin menghapus karyawan <strong class="text-slate-800">{{ employeeToDelete?.name }}</strong> ({{ employeeToDelete?.id }})? Tindakan ini tidak dapat dibatalkan.
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
