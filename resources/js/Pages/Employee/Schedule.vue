<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { currentEmployee, schedules } from '@/stores/appState.js';

// Toast
const toastMessage = ref('');
const showToast = ref(false);
const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3500);
};

const daysMeta = [
    { label: 'Sen, 5' },
    { label: 'Sel, 6' },
    { label: 'Rab, 7' },
    { label: 'Kam, 8' },
    { label: 'Jum, 9' },
    { label: 'Sab, 10' },
    { label: 'Min, 11' },
];

const getTimeForShift = (s) => {
    switch(s) {
        case 'Shift 1': return '08.00 – 17.00';
        case 'Shift 2': return '16.00 – 00.00';
        case 'Shift 3': return '00.00 – 08.00';
        case 'Libur': return 'Libur';
        default: return '08.00 – 17.00';
    }
};

const roster = computed(() => {
    const empId = currentEmployee.value.id;
    const empSchedule = schedules.value[empId] || ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur', 'Shift 1'];

    return daysMeta.map((day, idx) => {
        const s = empSchedule[idx] || 'Shift 1';
        return {
            day: day.label,
            shift: s,
            time: getTimeForShift(s),
            isOff: s === 'Libur',
        };
    });
});
</script>

<template>
    <Head title="Jadwal Minggu Ini - Premium Es Kristal" />

    <div class="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
            
            <!-- Toast Notification -->
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce-subtle">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-sm font-medium">{{ toastMessage }}</span>
            </div>

            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 class="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Jadwal minggu ini</h1>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">
                        Shift kerja Anda untuk 5–11 Oktober 2026 • {{ currentEmployee.name }}.
                    </p>
                </div>
                <div class="flex items-center gap-3">
                    <span class="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md border border-blue-200/80">
                        Divisi {{ currentEmployee.division }}
                    </span>
                </div>
            </div>

            <!-- Main Card (Reference Photo 3) -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-5xl shadow-xs overflow-hidden">
                
                <!-- Card Header -->
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                        <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>Roster mingguan</span>
                    </h2>
                    <span class="text-xs font-medium text-slate-500">5–11 Oktober 2026 • WITA</span>
                </div>

                <!-- 7 Columns Table -->
                <div class="overflow-x-auto border border-slate-200 rounded-xl">
                    <table class="w-full text-center text-sm whitespace-nowrap">
                        <thead class="bg-slate-50 text-xs text-slate-500 font-semibold border-b border-slate-200">
                            <tr>
                                <th v-for="col in roster" :key="col.day" class="py-3 px-4 font-semibold border-r border-slate-200 last:border-r-0">
                                    {{ col.day }}
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-x divide-slate-200">
                            <tr>
                                <td v-for="col in roster" :key="col.day" class="py-6 px-4 align-middle">
                                    <div class="mb-2">
                                        <span class="inline-block text-xs font-semibold px-2.5 py-1 rounded-md border"
                                            :class="col.isOff 
                                                ? 'bg-slate-100 text-slate-500 border-slate-200' 
                                                : 'bg-blue-50 text-blue-700 border-blue-200'">
                                            {{ col.shift }}
                                        </span>
                                    </div>
                                    <div class="text-xs" :class="col.isOff ? 'text-slate-400' : 'text-slate-500'">
                                        {{ col.time }}
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Shift Legend Pills -->
                <div class="mt-6 flex flex-wrap items-center gap-2.5 text-xs">
                    <span class="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        Shift 1 • 08.00 – 17.00
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        Shift 2 • 16.00 – 00.00
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        Shift 3 • 00.00 – 08.00
                    </span>
                    <span class="inline-flex items-center px-3 py-1 rounded-full font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                        Libur
                    </span>
                </div>

            </div>

        </div>
</template>
