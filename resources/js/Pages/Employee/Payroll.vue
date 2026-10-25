<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { currentEmployee, payrollAdjustments } from '@/stores/appState.js';

const showSlipModal = ref(false);

const pointsData = computed(() => {
    const pts = currentEmployee.value.points || 270;
    const max = 900;
    const progressPercentage = Math.min(100, Math.round((pts / max) * 100));

    let currentReward = 'Rp 0';
    let pointsNeeded = 500 - pts;
    let nextTargetReward = 'Rp100.000';

    if (pts >= 900) {
        currentReward = 'Rp250.000';
        pointsNeeded = 0;
        nextTargetReward = 'Maksimal';
    } else if (pts >= 750) {
        currentReward = 'Rp150.000';
        pointsNeeded = 900 - pts;
        nextTargetReward = 'Rp250.000';
    } else if (pts >= 500) {
        currentReward = 'Rp100.000';
        pointsNeeded = 750 - pts;
        nextTargetReward = 'Rp150.000';
    } else {
        pointsNeeded = Math.max(0, 500 - pts);
        nextTargetReward = 'Rp100.000';
    }

    return {
        current: pts,
        max,
        progressPercentage,
        currentReward,
        pointsNeeded,
        nextTargetReward,
        tiers: [
            { label: '≥ 900 poin', reward: 'Rp250.000' },
            { label: '750–899 poin', reward: 'Rp150.000' },
            { label: '500–749 poin', reward: 'Rp100.000' },
            { label: '< 500 poin', reward: 'Belum ada reward' },
        ],
    };
});

const salaryData = computed(() => {
    const emp = currentEmployee.value;
    const daysWorked = 9;
    const dailyWage = Number(emp.wage) || 60000;
    const grossSalary = daysWorked * dailyWage;

    // Adjustments
    const empAdj = payrollAdjustments.value[emp.id] || [];
    const bonus = empAdj.filter(a => a.type === 'bonus').reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    const deductions = empAdj.filter(a => a.type === 'potongan').reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    
    // Reward bonus from points
    let rewardFromPoints = 0;
    if (emp.points >= 900) rewardFromPoints = 250000;
    else if (emp.points >= 750) rewardFromPoints = 150000;
    else if (emp.points >= 500) rewardFromPoints = 100000;

    const totalReward = rewardFromPoints + bonus;
    const totalSalary = Math.max(0, grossSalary + totalReward - deductions);

    return {
        period: 'Periode Oktober 2026 • Sementara',
        daysWorked,
        dailyWage,
        baseWage: `Rp ${grossSalary.toLocaleString('id-ID')}`,
        rewardBonus: `+ Rp ${totalReward.toLocaleString('id-ID')}`,
        deductions: `- Rp ${deductions.toLocaleString('id-ID')}`,
        totalSalary: `Rp ${totalSalary.toLocaleString('id-ID')}`,
        grossSalary,
        totalReward,
        deductionsNum: deductions,
        totalSalaryNum: totalSalary,
    };
});

const printSlip = () => {
    window.print();
};
</script>

<template>
    <Head title="Poin & Gaji Saya - Premium Es Kristal" />

    <div class="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
            
            <!-- Page Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Poin & gaji saya</h1>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">
                        Rincian poin kehadiran real-time dan estimasi gaji berjalan Oktober 2026.
                    </p>
                </div>
                <button @click="showSlipModal = true" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-2xs">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    <span>Cetak Slip Sementara</span>
                </button>
            </div>

            <!-- 2 Columns Grid (Reference Photo 4) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                
                <!-- Left Card: Poin kehadiran -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                    <div>
                        <!-- Header -->
                        <div class="flex items-center gap-2 text-base font-bold text-slate-900">
                            <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                            <span>Poin kehadiran</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1 mb-4">Oktober 2026 • {{ currentEmployee.name }}</p>

                        <!-- Large Stat -->
                        <div class="flex items-baseline gap-1.5 mb-3">
                            <span class="text-4xl sm:text-[40px] font-black text-slate-900 leading-none">{{ pointsData.current }}</span>
                            <span class="text-sm font-medium text-slate-500">/ {{ pointsData.max }} poin</span>
                        </div>

                        <!-- Progress Bar -->
                        <div class="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                            <div class="bg-blue-600 h-full rounded-full transition-all duration-500" :style="{ width: `${pointsData.progressPercentage}%` }"></div>
                        </div>

                        <!-- Sub-bar text -->
                        <div class="flex items-center justify-between text-xs text-slate-500">
                            <span>Reward saat ini {{ pointsData.currentReward }}</span>
                            <span v-if="pointsData.pointsNeeded > 0">{{ pointsData.pointsNeeded }} poin menuju {{ pointsData.nextTargetReward }}</span>
                            <span v-else class="text-emerald-600 font-bold">Reward Maksimal Tercapai!</span>
                        </div>

                        <!-- Tier list -->
                        <div class="mt-8">
                            <h3 class="text-xs font-semibold text-slate-500 mb-2">Tingkat reward bulanan</h3>
                            <div class="divide-y divide-slate-100 text-sm">
                                <div v-for="tier in pointsData.tiers" :key="tier.label" class="py-2.5 flex items-center justify-between text-slate-700">
                                    <span>{{ tier.label }}</span>
                                    <span class="font-medium text-slate-900">{{ tier.reward }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Right Card: Estimasi gaji -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                    <div>
                        <!-- Header -->
                        <div class="flex items-center gap-2 text-base font-bold text-slate-900">
                            <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                            <span>Estimasi gaji</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-1 mb-4">{{ salaryData.period }}</p>

                        <!-- Breakdown Rows -->
                        <div class="space-y-3.5 text-sm">
                            <div class="flex items-center justify-between">
                                <span class="text-slate-600">Gaji ({{ salaryData.daysWorked }} hari x Rp {{ salaryData.dailyWage.toLocaleString('id-ID') }})</span>
                                <span class="text-slate-900 font-medium">{{ salaryData.baseWage }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-600">Reward poin & bonus</span>
                                <span class="text-emerald-600 font-medium">{{ salaryData.rewardBonus }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-slate-600">Potongan & denda</span>
                                <span class="text-rose-500 font-medium">{{ salaryData.deductions }}</span>
                            </div>

                            <!-- Total Divider -->
                            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
                                <span class="text-base font-bold text-slate-900">Total</span>
                                <span class="text-2xl font-bold text-slate-900">{{ salaryData.totalSalary }}</span>
                            </div>
                        </div>

                        <!-- Disclaimer -->
                        <p class="text-xs text-slate-400 mt-8 leading-relaxed">
                            Estimasi berdasarkan hari dibayar dan aturan reward yang berjalan. Slip resmi diterbitkan akhir periode.
                        </p>
                    </div>
                </div>

            </div>

            <!-- Preview Slip Gaji Modal -->
            <div v-if="showSlipModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div>
                            <h3 class="text-base font-bold text-slate-900">Slip Gaji Sementara</h3>
                            <p class="text-xs text-slate-500">{{ currentEmployee.name }} • {{ currentEmployee.division }} ({{ currentEmployee.id }})</p>
                        </div>
                        <button @click="showSlipModal = false" class="text-slate-400 hover:text-slate-600 p-1">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div class="bg-slate-50 rounded-xl p-4 space-y-2 text-xs border border-slate-100 mb-4">
                        <div class="flex justify-between">
                            <span class="text-slate-500">Upah Pokok Harian:</span>
                            <span class="font-bold text-slate-800">Rp {{ salaryData.dailyWage.toLocaleString('id-ID') }} / hari</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Hari Masuk Aktual:</span>
                            <span class="font-bold text-slate-800">{{ salaryData.daysWorked }} Hari</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Gaji Pokok Kehadiran:</span>
                            <span class="font-bold text-slate-800">{{ salaryData.baseWage }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Bonus Reward Poin:</span>
                            <span class="font-bold text-emerald-600">{{ salaryData.rewardBonus }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-slate-500">Potongan Denda:</span>
                            <span class="font-bold text-rose-600">{{ salaryData.deductions }}</span>
                        </div>
                        <div class="pt-2 border-t border-slate-200 flex justify-between items-center text-sm">
                            <span class="font-bold text-slate-900">Total Take Home Pay:</span>
                            <span class="font-black text-blue-600">{{ salaryData.totalSalary }}</span>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 pt-2 border-t border-slate-100">
                        <button @click="showSlipModal = false" class="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50">Tutup</button>
                        <button @click="printSlip" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            <span>Cetak Slip</span>
                        </button>
                    </div>
                </div>
            </div>

        </div>
</template>
