<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';

// Filter & Search states
const searchQuery = ref('');
const selectedDivision = ref('Semua divisi');
const divisions = ['Semua divisi', 'Produksi', 'Kasir', 'Supervisor', 'Driver'];

// Pagination (6 data per halaman)
const currentPage = ref(1);
const perPage = ref(6);

// Import from appState store
import { 
    employees as rawEmployees, 
    payrollAdjustments, 
    addPayrollAdjustment, 
    deletePayrollAdjustment 
} from '@/stores/appState.js';

// Modal states
const showSlipModal = ref(false);
const showAdjustmentModal = ref(false);
const selectedEmployee = ref(null);
const showPrintRecapModal = ref(false);
const toastMessage = ref('');
const showToast = ref(false);

const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3500);
};

// Form for adding new adjustment (bonus or deduction)
const adjustmentForm = ref({
    type: 'bonus',
    title: '',
    amount: 50000,
});

const openAdjustmentModal = (emp) => {
    if (!emp.isActive) {
        alert('Karyawan ini berstatus Nonaktif. Aktifkan kembali karyawan terlebih dahulu untuk menambahkan penyesuaian gaji.');
        return;
    }
    selectedEmployee.value = emp;
    adjustmentForm.value = {
        type: 'bonus',
        title: '',
        amount: 50000,
    };
    showAdjustmentModal.value = true;
};

const submitAdjustment = () => {
    if (!selectedEmployee.value) return;
    if (!adjustmentForm.value.title.trim()) {
        alert('Keterangan penyesuaian wajib diisi!');
        return;
    }
    addPayrollAdjustment(selectedEmployee.value.id, {
        type: adjustmentForm.value.type,
        title: adjustmentForm.value.title,
        amount: adjustmentForm.value.amount,
    });
    triggerToast(`${adjustmentForm.value.type === 'bonus' ? 'Bonus' : 'Potongan'} berhasil ditambahkan untuk ${selectedEmployee.value.name}!`);
    adjustmentForm.value.title = '';
};

const removeAdjustment = (empId, adjId) => {
    deletePayrollAdjustment(empId, adjId);
    triggerToast('Penyesuaian gaji berhasil dihapus.');
};

// Dynamic Payroll calculation based on active employees and adjustments
const employees = computed(() => {
    return rawEmployees.value.map(emp => {
        const isActive = emp.isActive !== false;
        const daysPaid = isActive ? 9 : 0; // Current pay cycle worked days
        const dailyWage = Number(emp.wage) || 50000;
        const grossSalary = isActive ? (daysPaid * dailyWage) : 0;
        const currentPoints = isActive ? (emp.points || 250) : 0;

        // Base reward from points tier
        let baseReward = 0;
        if (isActive) {
            if (currentPoints >= 900) baseReward = 250000;
            else if (currentPoints >= 750) baseReward = 150000;
            else if (currentPoints >= 500) baseReward = 100000;
        }

        // Custom adjustments from store
        const empAdjustments = isActive ? (payrollAdjustments.value[emp.id] || []) : [];
        const customBonus = empAdjustments.filter(a => a.type === 'bonus').reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
        const customDeduction = empAdjustments.filter(a => a.type === 'potongan').reduce((acc, a) => acc + (Number(a.amount) || 0), 0);

        const reward = isActive ? (baseReward + customBonus) : 0;
        const deduction = isActive ? customDeduction : 0;
        const total = isActive ? Math.max(0, grossSalary + reward - deduction) : 0;

        const deductionsDetail = [
            ...empAdjustments.filter(a => a.type === 'potongan').map(a => ({ reason: a.title, amount: a.amount })),
        ];

        return {
            id: emp.id,
            name: emp.name,
            division: emp.division,
            initials: emp.initials || emp.name.split(' ').map(n => n[0]).join(''),
            avatarBg: emp.avatarBg || 'bg-blue-100 text-blue-700',
            isActive,
            daysPaid,
            dailyWage,
            currentPoints,
            grossSalary,
            reward,
            deduction,
            total,
            deductionsDetail,
            adjustments: empAdjustments,
        };
    });
});

// Summary Calculations (Hanya menghitung karyawan aktif)
const totalGross = computed(() => {
    return employees.value.filter(e => e.isActive).reduce((acc, curr) => acc + curr.total, 0);
});

const totalReward = computed(() => {
    return employees.value.filter(e => e.isActive).reduce((acc, curr) => acc + curr.reward, 0);
});

const totalDeductions = computed(() => {
    return employees.value.filter(e => e.isActive).reduce((acc, curr) => acc + curr.deduction, 0);
});

const activeReceiversCount = computed(() => {
    return employees.value.filter(e => e.isActive).length;
});

const filteredEmployees = computed(() => {
    return employees.value.filter(emp => {
        const matchName = emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchDiv = selectedDivision.value === 'Semua divisi' || emp.division === selectedDivision.value;
        return matchName && matchDiv;
    });
});

const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    return filteredEmployees.value.slice(start, start + perPage.value);
});

const totalPages = computed(() => {
    return Math.ceil(filteredEmployees.value.length / perPage.value) || 1;
});

watch([searchQuery, selectedDivision], () => {
    currentPage.value = 1;
});

const formatCurrency = (val) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const openSlip = (emp) => {
    selectedEmployee.value = emp;
    showSlipModal.value = true;
};

const printSlip = () => {
    window.print();
};

const exportCSV = () => {
    const headers = ['NIK,Nama Karyawan,Divisi,Hari Dibayar,Gaji Berjalan,Reward,Potongan,Total Diterima'];
    const rows = filteredEmployees.value.map(e => 
        `"${e.id}","${e.name}","${e.division}",${e.daysPaid},${e.grossSalary},${e.reward},${e.deduction},${e.total}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap_payroll_oktober_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Rekap payroll berhasil diekspor ke rekap_payroll_oktober_2026.csv');
};
</script>

<template>
    <Head title="Payroll & Reward" />

    <div class="p-8 max-w-[1600px] mx-auto w-full space-y-6">

            <!-- Toast Notification -->
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-sm font-medium">{{ toastMessage }}</span>
            </div>
            
            <!-- Page Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Daftar Gaji & Reward</h1>
                    <p class="text-slate-500 mt-1">Estimasi gaji berjalan berdasarkan kehadiran dan perolehan poin.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="showPrintRecapModal = true" class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                        </svg>
                        Cetak rekap
                    </button>
                    <button @click="exportCSV" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                        Ekspor CSV
                    </button>
                </div>
            </div>

            <!-- 4 Metrics Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <!-- Card 1: Total Gaji Berjalan -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div class="flex items-start justify-between mb-4">
                        <p class="text-[13px] font-semibold text-slate-600">Total gaji berjalan</p>
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <span class="text-3xl font-extrabold text-slate-900 block mb-1">{{ formatCurrency(totalGross) }}</span>
                        <span class="text-[11px] font-medium text-slate-500">Estimasi gaji aktif berjalan</span>
                    </div>
                </div>

                <!-- Card 2: Total Reward -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div class="flex items-start justify-between mb-4">
                        <p class="text-[13px] font-semibold text-slate-600">Total reward</p>
                        <div class="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <span class="text-3xl font-extrabold text-slate-900 block mb-1">{{ formatCurrency(totalReward) }}</span>
                        <span class="text-[11px] font-medium text-slate-500">Reward poin karyawan aktif</span>
                    </div>
                </div>

                <!-- Card 3: Total Potongan -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div class="flex items-start justify-between mb-4">
                        <p class="text-[13px] font-semibold text-slate-600">Total potongan</p>
                        <div class="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <span class="text-3xl font-extrabold text-slate-900 block mb-1">{{ formatCurrency(totalDeductions) }}</span>
                        <span class="text-[11px] font-medium text-slate-500">Denda kehadiran & potongan</span>
                    </div>
                </div>

                <!-- Card 4: Penerima Payroll -->
                <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div class="flex items-start justify-between mb-4">
                        <p class="text-[13px] font-semibold text-slate-600">Penerima Gaji</p>
                        <div class="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <div>
                        <span class="text-3xl font-extrabold text-slate-900 block mb-1">
                            {{ activeReceiversCount }} <span class="text-sm font-normal text-slate-500 ml-1">karyawan aktif</span>
                        </span>
                        <span class="text-[11px] font-medium text-slate-500">{{ employees.length }} total • Periode Oktober 2026</span>
                    </div>
                </div>
            </div>

            <!-- Info Bar / Period Banner -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-1">
                <div class="inline-flex items-center gap-2 bg-blue-50/70 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                    <svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    Periode 1-31 Oktober 2026 • Estimasi berjalan
                </div>
                <div class="text-xs text-slate-500 font-medium">
                    Karyawan nonaktif ditangguhkan dari penerimaan upah & reward.
                </div>
            </div>

            <!-- Table Card: Rekap payroll karyawan -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                
                <!-- Table Header Controls -->
                <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h3 class="text-base font-bold text-slate-900">Rekap gaji karyawan</h3>
                        <p class="text-xs text-slate-500 mt-0.5">Gaji belum final • Periode masih berjalan</p>
                    </div>

                    <div class="flex flex-wrap items-center gap-3">
                        <!-- Search Box -->
                        <div class="relative">
                            <input v-model="searchQuery" type="text" placeholder="Cari nama karyawan..." 
                                class="w-56 pl-9 pr-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/70 hover:bg-white focus:bg-white text-slate-800 transition-all">
                            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>

                        <!-- Division Filter -->
                        <div class="relative inline-block">
                            <select v-model="selectedDivision" class="appearance-none pl-3.5 pr-10 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer transition-all">
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

                <!-- Table Content -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50/70 text-slate-500 border-b border-slate-100 font-semibold">
                            <tr>
                                <th class="px-6 py-4">Karyawan</th>
                                <th class="px-6 py-4">Hari dibayar</th>
                                <th class="px-6 py-4">Gaji berjalan</th>
                                <th class="px-6 py-4">Reward</th>
                                <th class="px-6 py-4">Potongan</th>
                                <th class="px-6 py-4">Total diterima</th>
                                <th class="px-6 py-4 text-center">Slip</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-600">
                            <tr v-for="emp in paginatedEmployees" :key="emp.id" 
                                class="hover:bg-slate-50/60 transition-colors"
                                :class="!emp.isActive ? 'bg-slate-50/30' : ''">
                                
                                <!-- Employee Info -->
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0" 
                                            :class="emp.isActive ? emp.avatarBg : 'bg-slate-200 text-slate-500'">
                                            {{ emp.initials }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                                                <span>{{ emp.name }}</span>
                                                <span v-if="!emp.isActive" class="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                                    Nonaktif
                                                </span>
                                            </p>
                                            <p class="text-[11px] text-slate-400 mt-0.5">{{ emp.division }} • {{ emp.id }}</p>
                                        </div>
                                    </div>
                                </td>

                                <!-- Hari Dibayar -->
                                <td class="px-6 py-4 font-medium" :class="emp.isActive ? 'text-slate-600' : 'text-slate-400 italic'">
                                    {{ emp.isActive ? `${emp.daysPaid} hari` : '0 hari (Nonaktif)' }}
                                </td>

                                <!-- Gaji Berjalan -->
                                <td class="px-6 py-4 font-semibold" :class="emp.isActive ? 'text-slate-700' : 'text-slate-400'">
                                    {{ emp.isActive ? formatCurrency(emp.grossSalary) : 'Rp 0' }}
                                </td>

                                <!-- Reward -->
                                <td class="px-6 py-4 font-semibold" :class="emp.isActive ? 'text-slate-700' : 'text-slate-400'">
                                    {{ emp.isActive ? formatCurrency(emp.reward) : 'Rp 0' }}
                                </td>

                                <!-- Potongan -->
                                <td class="px-6 py-4 font-semibold" :class="emp.isActive && emp.deduction > 0 ? 'text-rose-600' : 'text-slate-400'">
                                    <span v-if="emp.isActive && emp.deduction > 0">- {{ formatCurrency(emp.deduction) }}</span>
                                    <span v-else-if="emp.isActive">{{ formatCurrency(0) }}</span>
                                    <span v-else>Rp 0</span>
                                </td>

                                <!-- Total Diterima -->
                                <td class="px-6 py-4 font-bold text-sm" :class="emp.isActive ? 'text-slate-900' : 'text-slate-400 italic'">
                                    {{ emp.isActive ? formatCurrency(emp.total) : 'Rp 0 (Ditangguhkan)' }}
                                </td>

                                <!-- Action Icons: Sesuaikan & Slip -->
                                <td class="px-6 py-4 text-center space-x-1">
                                    <button @click="openAdjustmentModal(emp)" 
                                        :title="emp.isActive ? 'Sesuaikan Bonus & Potongan' : 'Karyawan nonaktif - penyesuaian ditangguhkan'"
                                        :disabled="!emp.isActive"
                                        class="w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors"
                                        :class="emp.isActive ? 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer' : 'text-slate-300 cursor-not-allowed'">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
                                        </svg>
                                    </button>
                                    <button @click="openSlip(emp)" title="Lihat Slip Gaji"
                                        class="w-8 h-8 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    </button>
                                </td>
                            </tr>

                            <tr v-if="filteredEmployees.length === 0">
                                <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                                    Tidak ada data karyawan yang sesuai dengan kriteria pencarian.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Table Footer (Pagination 6 data per halaman) -->
                <div class="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <div>
                        Menampilkan 
                        <span class="font-semibold text-slate-700">{{ filteredEmployees.length === 0 ? 0 : ((currentPage - 1) * perPage) + 1 }}</span> - 
                        <span class="font-semibold text-slate-700">{{ Math.min(currentPage * perPage, filteredEmployees.length) }}</span> 
                        dari <span class="font-semibold text-slate-700">{{ filteredEmployees.length }}</span> karyawan
                    </div>

                    <div class="flex items-center gap-2">
                        <button @click="currentPage--" :disabled="currentPage === 1"
                            class="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors">
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
                        <button @click="currentPage++" :disabled="currentPage >= totalPages"
                            class="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors">
                            Selanjutnya
                        </button>
                    </div>
                </div>

            </div>

            <!-- Reward Kehadiran Bulanan Section -->
            <div class="pt-2">
                <h3 class="text-sm font-bold text-slate-900 mb-3">Reward kehadiran bulanan</h3>
                <div class="flex flex-wrap items-center gap-2.5">
                    
                    <!-- Tier 1 -->
                    <div class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200/80">
                        0-499 poin - Rp0
                    </div>

                    <!-- Tier 2 -->
                    <div class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        500-749 poin - Rp100.000
                    </div>

                    <!-- Tier 3 -->
                    <div class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        750-899 poin - Rp150.000
                    </div>

                    <!-- Tier 4 -->
                    <div class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        900+ poin - Rp250.000
                    </div>

                </div>
            </div>

            <!-- Footer -->
            <div class="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
                <div>© 2026 Premium Es Kristal. Semua hak dilindungi.</div>
                <div class="flex items-center gap-4">
                    <span>Sistem Payroll Terintegrasi Absensi & Shift WITA</span>
                </div>
            </div>

        </div>

        <!-- MODAL SLIP GAJI SEMENTARA -->
        <div v-if="showSlipModal && selectedEmployee" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
                
                <!-- Slip Header -->
                <div class="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                        <div class="flex items-center gap-2">
                            <img src="/images/logo-premium.png" alt="Logo-Premium" class="w-8 h-8">
                            <h3 class="text-base font-bold text-slate-900">Estimasi Slip Gaji Karyawan</h3>
                        </div>
                        <p class="text-xs text-slate-500 mt-1">Periode 1 - 31 Oktober 2026 (Estimasi per 9 Oktober)</p>
                    </div>
                    <button @click="showSlipModal = false" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <!-- Employee Identity Box -->
                <div class="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5 text-xs grid grid-cols-2 gap-3">
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Nama Karyawan</span>
                        <span class="font-bold text-slate-800 text-sm">{{ selectedEmployee.name }}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">ID / NIK</span>
                        <span class="font-bold text-slate-800 text-sm">{{ selectedEmployee.id }}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Divisi Penugasan</span>
                        <span class="font-medium text-slate-700">{{ selectedEmployee.division }}</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Upah Pokok Harian</span>
                        <span class="font-medium text-slate-700">{{ formatCurrency(selectedEmployee.dailyWage) }} / hari</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Hari Dibayar Aktual</span>
                        <span class="font-medium text-slate-700">{{ selectedEmployee.daysPaid }} Hari Kerja</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-semibold">Akumulasi Poin Presensi</span>
                        <span class="font-bold text-blue-600">{{ selectedEmployee.currentPoints }} Poin</span>
                    </div>
                </div>

                <!-- Breakdown Komponen Gaji -->
                <div class="space-y-4 mb-6 text-xs">
                    
                    <!-- Penghasilan Kotor -->
                    <div>
                        <p class="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                            <span>Komponen Pendapatan (+)</span>
                            <span class="text-slate-500 font-normal">{{ selectedEmployee.daysPaid }} hari x {{ formatCurrency(selectedEmployee.dailyWage) }}</span>
                        </p>
                        <div class="bg-slate-50/60 rounded-lg p-3 space-y-2 border border-slate-100">
                            <div class="flex justify-between items-center text-slate-600">
                                <span>Gaji Pokok Kehadiran Berjalan</span>
                                <span class="font-semibold text-slate-800">{{ formatCurrency(selectedEmployee.grossSalary) }}</span>
                            </div>
                            <div class="flex justify-between items-center text-slate-600">
                                <span>Bonus Reward Poin (Bulan Berjalan)</span>
                                <span class="font-semibold text-slate-800">{{ formatCurrency(selectedEmployee.reward) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Potongan -->
                    <div>
                        <p class="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                            Komponen Pemotongan / Denda (-)
                        </p>
                        <div class="bg-rose-50/40 rounded-lg p-3 space-y-2 border border-rose-100">
                            <div v-if="selectedEmployee.deductionsDetail.length > 0" class="space-y-1.5">
                                <div v-for="(item, idx) in selectedEmployee.deductionsDetail" :key="idx" class="flex justify-between items-center text-rose-700 text-xs">
                                    <span>{{ item.reason }}</span>
                                    <span class="font-semibold">- {{ formatCurrency(item.amount) }}</span>
                                </div>
                            </div>
                            <div v-else class="text-slate-500 text-xs italic">
                                Tidak ada catatan denda / pemotongan absensi.
                            </div>
                        </div>
                    </div>

                    <!-- Total Diterima Net -->
                    <div class="pt-3 border-t border-slate-200 flex items-center justify-between">
                        <div>
                            <span class="text-xs font-bold text-slate-900 block">Total Estimasi Diterima</span>
                            <span class="text-[10px] text-slate-400">Take home pay berjalan</span>
                        </div>
                        <div class="text-xl font-extrabold text-blue-600">
                            {{ formatCurrency(selectedEmployee.total) }}
                        </div>
                    </div>

                </div>

                <!-- Modal Actions -->
                <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button @click="showSlipModal = false" class="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Tutup
                    </button>
                    <button @click="printSlip" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Cetak Slip
                    </button>
                </div>

            </div>
        </div>

        <!-- MODAL PREVIEW CETAK REKAP LENGKAP -->
        <div v-if="showPrintRecapModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div class="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col">
                <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Preview Rekapitulasi Gaji Karyawan</h3>
                        <p class="text-xs text-slate-500">PT. Premium Es Kristal • Periode 1-31 Oktober 2026</p>
                    </div>
                    <button @click="showPrintRecapModal = false" class="text-slate-400 hover:text-slate-600 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="overflow-y-auto flex-1 mb-4 border border-slate-100 rounded-xl">
                    <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                                <th class="p-3">No</th>
                                <th class="p-3">Nama Karyawan</th>
                                <th class="p-3">Divisi</th>
                                <th class="p-3 text-center">Hari Kerja</th>
                                <th class="p-3 text-right">Gaji Berjalan</th>
                                <th class="p-3 text-right">Potongan</th>
                                <th class="p-3 text-right">Total Bersih</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="(emp, idx) in employees" :key="emp.id" class="text-slate-700">
                                <td class="p-3 font-mono">{{ idx + 1 }}</td>
                                <td class="p-3 font-bold text-slate-900">{{ emp.name }}</td>
                                <td class="p-3">{{ emp.division }}</td>
                                <td class="p-3 text-center">{{ emp.daysPaid }} Hari</td>
                                <td class="p-3 text-right font-medium">{{ formatCurrency(emp.grossSalary) }}</td>
                                <td class="p-3 text-right" :class="emp.deduction > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'">
                                    {{ emp.deduction > 0 ? '- ' + formatCurrency(emp.deduction) : 'Rp 0' }}
                                </td>
                                <td class="p-3 text-right font-bold text-slate-900">{{ formatCurrency(emp.total) }}</td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-slate-50/80 font-bold border-t border-slate-200 text-slate-900">
                            <tr>
                                <td colspan="4" class="p-3 text-right">Grand Total:</td>
                                <td class="p-3 text-right font-bold">{{ formatCurrency(5565000) }}</td>
                                <td class="p-3 text-right text-rose-600 font-bold">- {{ formatCurrency(totalDeductions) }}</td>
                                <td class="p-3 text-right text-blue-600 font-extrabold">{{ formatCurrency(totalGross) }}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button @click="showPrintRecapModal = false" class="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Tutup
                    </button>
                    <button @click="printSlip" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Cetak Laporan Rekap
                    </button>
                </div>
            </div>
        </div>

        <!-- MODAL SESUAIKAN BONUS & POTONGAN -->
        <div v-if="showAdjustmentModal && selectedEmployee" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 flex flex-col space-y-4">
                <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                        <h3 class="text-base font-bold text-slate-900">Sesuaikan Bonus & Potongan</h3>
                        <p class="text-xs text-slate-500">{{ selectedEmployee.name }} ({{ selectedEmployee.id }})</p>
                    </div>
                    <button @click="showAdjustmentModal = false" class="text-slate-400 hover:text-slate-600 p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <!-- Existing Adjustments List -->
                <div v-if="selectedEmployee.adjustments && selectedEmployee.adjustments.length > 0" class="space-y-2 max-h-40 overflow-y-auto pr-1">
                    <p class="text-xs font-semibold text-slate-700">Penyesuaian Aktif:</p>
                    <div v-for="adj in selectedEmployee.adjustments" :key="adj.id" class="flex items-center justify-between p-2.5 rounded-lg border text-xs" :class="adj.type === 'bonus' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' : 'bg-rose-50/70 border-rose-200 text-rose-800'">
                        <div>
                            <span class="font-bold">{{ adj.title }}</span>
                            <span class="text-[10px] ml-1.5 opacity-70">({{ adj.type === 'bonus' ? '+' : '-' }} Rp {{ adj.amount.toLocaleString('id-ID') }})</span>
                        </div>
                        <button @click="removeAdjustment(selectedEmployee.id, adj.id)" class="text-slate-400 hover:text-rose-600 p-1" title="Hapus Penyesuaian">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </div>
                </div>

                <!-- Form Add Adjustment -->
                <form @submit.prevent="submitAdjustment" class="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                    <p class="text-xs font-bold text-slate-800">Tambah Penyesuaian Baru:</p>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="text-[11px] font-semibold text-slate-600 block mb-1">Jenis</label>
                            <select v-model="adjustmentForm.type" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none">
                                <option value="bonus">+ Bonus Tambahan</option>
                                <option value="potongan">- Potongan / Denda</option>
                            </select>
                        </div>
                        <div>
                            <label class="text-[11px] font-semibold text-slate-600 block mb-1">Jumlah (Rp)</label>
                            <input v-model="adjustmentForm.amount" type="number" step="10000" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="50000" />
                        </div>
                    </div>

                    <div>
                        <label class="text-[11px] font-semibold text-slate-600 block mb-1">Keterangan / Alasan</label>
                        <input v-model="adjustmentForm.title" type="text" class="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Contoh: Bonus Lembur Shift 3 / Kasbon..." />
                    </div>

                    <button type="submit" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors">
                        Tambahkan Penyesuaian
                    </button>
                </form>

                <div class="flex justify-end pt-2 border-t border-slate-100">
                    <button @click="showAdjustmentModal = false" class="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                        Selesai
                    </button>
                </div>
            </div>
        </div>

</template>
