<script setup>
import { Head, Link } from '@inertiajs/vue3';
import { computed } from 'vue';
import { 
    currentEmployee, 
    todayEmployeeAttendance, 
    payrollAdjustments 
} from '@/stores/appState.js';

const employee = computed(() => {
    const emp = currentEmployee.value;
    const todayAtt = todayEmployeeAttendance.value;
    const isActive = emp.isActive !== false;
    const pts = isActive ? (emp.points || 270) : 0;
    const targetRewardPoints = 900;
    const remainingPoints = Math.max(0, targetRewardPoints - pts);
    
    // Wage calculation
    const daysWorked = isActive ? 9 : 0;
    const dailyWage = Number(emp.wage) || 60000;
    const gross = daysWorked * dailyWage;

    // Adjustments
    const empAdj = isActive ? (payrollAdjustments.value[emp.id] || []) : [];
    const bonus = empAdj.filter(a => a.type === 'bonus').reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    const deduction = empAdj.filter(a => a.type === 'potongan').reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
    const totalSalary = isActive ? (gross + bonus - deduction) : 0;

    return {
        isActive,
        id: emp.id,
        name: emp.name.split(' ')[0],
        fullName: emp.name,
        division: emp.division,
        points: pts,
        targetRewardPoints,
        remainingPoints,
        rewardAmount: isActive ? 'Rp250.000' : 'Rp 0',
        runningSalary: isActive ? `Rp ${totalSalary.toLocaleString('id-ID')}` : 'Rp 0 (Ditangguhkan)',
        todayClockIn: isActive ? (todayAtt?.timeIn || '—') : '—',
        todayStatus: isActive ? (todayAtt?.status || 'Belum presensi') : 'Akun Nonaktif',
        period: 'Oktober 2026',
        initials: emp.initials || emp.name.split(' ').map(n => n[0]).join(''),
    };
});
</script>

<template>
    <Head title="Dashboard Karyawan - Premium Es Kristal" />

    <div class="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
            
            <!-- Inactive Employee Alert Banner -->
            <div v-if="!currentEmployee.isActive" class="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 shadow-xs">
                <div class="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center shrink-0 text-rose-600 font-bold">!</div>
                <div class="text-xs">
                    <strong class="font-bold">Akun Anda saat ini berstatus Nonaktif.</strong> Perhitungan upah berjalan dan presensi kehadiran ditangguhkan oleh administrator.
                </div>
            </div>

            <!-- Greeting & Division Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Halo, {{ employee.name }}</h1>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">Semangat bekerja! Setiap kehadiranmu menjaga kualitas es kristal kita.</p>
                </div>
                <div class="flex items-center gap-2">
                    <span v-if="!currentEmployee.isActive" class="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md border border-rose-200">
                        Nonaktif
                    </span>
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200/80">
                        {{ employee.division }} ({{ employee.id }})
                    </span>
                </div>
            </div>

            <!-- Row 1: 3 Metric Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <!-- Card 1: Poin kehadiran -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div class="flex items-start justify-between">
                        <span class="text-xs font-medium text-slate-500">Poin kehadiran</span>
                        <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-baseline gap-1">
                            <span class="text-3xl sm:text-[32px] font-black text-slate-900 leading-none">{{ employee.points }}</span>
                            <span class="text-xs font-medium text-slate-500">poin</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-2">{{ employee.remainingPoints }} poin menuju reward {{ employee.rewardAmount }}</p>
                    </div>
                </div>

                <!-- Card 2: Estimasi gaji -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div class="flex items-start justify-between">
                        <span class="text-xs font-medium text-slate-500">Estimasi gaji</span>
                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-baseline gap-1">
                            <span class="text-3xl sm:text-[32px] font-black text-slate-900 leading-none">{{ employee.runningSalary }}</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-2">Periode {{ employee.period }} • Sementara</p>
                    </div>
                </div>

                <!-- Card 3: Presensi hari ini -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
                    <div class="flex items-start justify-between">
                        <span class="text-xs font-medium text-slate-500">Presensi hari ini</span>
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex items-baseline gap-1.5">
                            <span class="text-3xl sm:text-[32px] font-black text-slate-900 leading-none">{{ employee.todayClockIn }}</span>
                            <span v-if="employee.todayClockIn !== '—'" class="text-xs font-medium text-slate-500">WITA</span>
                        </div>
                        <p class="text-xs text-slate-400 mt-2">Status: {{ employee.todayStatus }}</p>
                    </div>
                </div>

            </div>

            <!-- Row 2: 3 Navigation Action Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <!-- Card 1: Absensi saya -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div>
                        <div class="flex items-center gap-2 mb-1.5 text-slate-900">
                            <svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                            <h3 class="text-sm font-bold text-slate-900">Absensi saya</h3>
                        </div>
                        <p class="text-xs text-slate-500">Presensi masuk & pulang dengan selfie dan GPS.</p>
                    </div>
                    <Link href="/employee/attendance" class="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Buka Menu Absensi</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </Link>
                </div>

                <!-- Card 2: Jadwal minggu ini -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div>
                        <div class="flex items-center gap-2 mb-1.5 text-slate-900">
                            <svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                            <h3 class="text-sm font-bold text-slate-900">Jadwal minggu ini</h3>
                        </div>
                        <p class="text-xs text-slate-500">Shift kerja operasional mingguan Anda.</p>
                    </div>
                    <Link href="/employee/schedule" class="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Lihat Roster Shift</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </Link>
                </div>

                <!-- Card 3: Poin & gaji saya -->
                <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-sm transition-all group">
                    <div>
                        <div class="flex items-center gap-2 mb-1.5 text-slate-900">
                            <svg class="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                            <h3 class="text-sm font-bold text-slate-900">Poin & gaji saya</h3>
                        </div>
                        <p class="text-xs text-slate-500">Rincian reward poin dan estimasi slip gaji.</p>
                    </div>
                    <Link href="/employee/payroll" class="mt-5 text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Lihat Rincian Gaji</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    </Link>
                </div>

            </div>

            <!-- Row 3: Karyawan terbaik bulan ini Card -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <svg class="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        <span>Karyawan terbaik bulan ini</span>
                    </div>
                    <span class="text-xs text-slate-400">Oktober 2026</span>
                </div>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                            {{ employee.initials }}
                        </div>
                        <div>
                            <p class="text-sm font-bold text-slate-900">{{ employee.fullName }}</p>
                            <p class="text-xs text-slate-400">Divisi {{ employee.division }}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-bold text-slate-900 leading-none">{{ employee.points }}</p>
                        <p class="text-xs text-slate-400 mt-0.5">poin</p>
                    </div>
                </div>
            </div>

        </div>
</template>
