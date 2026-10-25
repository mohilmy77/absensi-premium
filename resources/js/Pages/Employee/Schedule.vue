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

// Shift swap modal
const showSwapModal = ref(false);
const swapForm = ref({
    day: 'Sen, 5',
    targetShift: 'Shift 2',
    reason: '',
});

const openSwapModal = () => {
    swapForm.value = {
        day: 'Sen, 5',
        targetShift: 'Shift 2',
        reason: '',
    };
    showSwapModal.value = true;
};

const submitSwapRequest = () => {
    if (!swapForm.value.reason.trim()) {
        alert('Keterangan / alasan tukar shift wajib diisi!');
        return;
    }
    triggerToast(`Pengajuan tukar shift pada ${swapForm.value.day} berhasil dikirim ke Supervisor/Admin untuk disetujui!`);
    showSwapModal.value = false;
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
                    <button @click="openSwapModal" class="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                        <span>Ajukan Tukar Shift</span>
                    </button>
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

            <!-- Ajukan Tukar Shift Modal -->
            <div v-if="showSwapModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 class="text-base font-bold text-slate-900">Ajukan Permohonan Tukar Shift</h3>
                            <p class="text-xs text-slate-500 mt-0.5">Pilih tanggal dan shift pengganti yang diinginkan.</p>
                        </div>
                        <button @click="showSwapModal = false" class="text-slate-400 hover:text-slate-600 p-1 rounded-md">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <form @submit.prevent="submitSwapRequest" class="p-6 space-y-4">
                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-600">Pilih Hari / Tanggal</label>
                            <select v-model="swapForm.day" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none">
                                <option v-for="d in daysMeta" :key="d.label" :value="d.label">{{ d.label }} Oktober 2026</option>
                            </select>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-600">Shift Yang Diinginkan</label>
                            <select v-model="swapForm.targetShift" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none">
                                <option value="Shift 1">Shift 1 (08.00 - 17.00)</option>
                                <option value="Shift 2">Shift 2 (16.00 - 00.00)</option>
                                <option value="Shift 3">Shift 3 (00.00 - 08.00)</option>
                                <option value="Libur">Libur / Off</option>
                            </select>
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-xs font-semibold text-slate-600">Alasan Permohonan <span class="text-rose-500">*</span></label>
                            <textarea v-model="swapForm.reason" rows="3" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none placeholder-slate-400" placeholder="Alasan keperluan mendesak tukar shift..."></textarea>
                        </div>

                        <div class="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button type="button" @click="showSwapModal = false" class="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Batal</button>
                            <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm">Kirim Permohonan</button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
</template>
