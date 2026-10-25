<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { 
    employees, 
    schedules, 
    setEmployeeSchedule, 
    saveAllSchedules 
} from '@/stores/appState.js';

const searchQuery = ref('');
const selectedDivision = ref('Semua divisi');
const divisions = ['Semua divisi', 'Produksi', 'Kasir', 'Supervisor', 'Driver'];

// Week navigation
const weekOffset = ref(0); // 0 = current week, -1 = last week, +1 = next week

const weekDates = computed(() => {
    const baseDate = new Date(2026, 9, 5); // Monday 5 Oct 2026
    baseDate.setDate(baseDate.getDate() + (weekOffset.value * 7));

    const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    return dayNames.map((name, i) => {
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() + i);
        return {
            name,
            date: `${d.getDate()} ${monthNames[d.getMonth()]}`,
            fullDate: d.toISOString().split('T')[0],
        };
    });
});

const currentWeekLabel = computed(() => {
    if (weekDates.value.length === 0) return '';
    return `${weekDates.value[0].date} - ${weekDates.value[6].date} 2026`;
});

const prevWeek = () => {
    weekOffset.value -= 1;
};

const nextWeek = () => {
    weekOffset.value += 1;
};

const shifts = ['Shift 1', 'Shift 2', 'Shift 3', 'Libur'];

const getShiftClass = (shift) => {
    switch(shift) {
        case 'Shift 1': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
        case 'Shift 2': return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
        case 'Shift 3': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
        case 'Libur': return 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100';
        default: return 'bg-white border-slate-200';
    }
};

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

// Merged employee schedule list
const employeeSchedules = computed(() => {
    return employees.value.map(emp => {
        // Ensure schedule array exists for each employee
        if (!schedules.value[emp.id]) {
            schedules.value[emp.id] = ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur', 'Shift 1'];
        }
        return {
            ...emp,
            schedule: schedules.value[emp.id],
        };
    });
});

const filteredEmployees = computed(() => {
    return employeeSchedules.value.filter(emp => {
        const matchName = emp.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          emp.id.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchDiv = selectedDivision.value === 'Semua divisi' || emp.division === selectedDivision.value;
        return matchName && matchDiv;
    });
});

const onShiftChange = (empId, dayIdx, newShift) => {
    setEmployeeSchedule(empId, dayIdx, newShift);
};

const saveSchedule = () => {
    saveAllSchedules(schedules.value);
    triggerToast('Jadwal shift seluruh karyawan berhasil disimpan ke sistem!');
};

const exportScheduleCSV = () => {
    const headers = ['NIK,Nama,Divisi,' + weekDates.value.map(d => `${d.name} (${d.date})`).join(',')];
    const rows = filteredEmployees.value.map(emp => {
        const shifts = emp.schedule.map(s => `"${s}"`).join(',');
        return `"${emp.id}","${emp.name}","${emp.division}",${shifts}`;
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jadwal_shift_${weekDates.value[0].date.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Jadwal shift berhasil diekspor ke file CSV!');
};
</script>

<template>
    <Head title="Jadwal Shift" />

    <div class="p-8 max-w-[1600px] mx-auto w-full space-y-6">
            
            <!-- Toast Notification -->
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce-subtle">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-sm font-medium">{{ toastMessage }}</span>
            </div>

            <!-- Header Section -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Jadwal shift</h1>
                    <p class="text-slate-500 mt-1">Roster mingguan untuk menjaga kelancaran operasional pabrik 24 jam non-stop.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="exportScheduleCSV" class="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Ekspor jadwal
                    </button>
                    <button @click="saveSchedule" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm active:scale-95">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                        Simpan jadwal
                    </button>
                </div>
            </div>

            <!-- Controls Row -->
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div class="flex items-center gap-3">
                    <div class="flex items-center bg-white border border-slate-200 rounded-lg shadow-sm">
                        <button @click="prevWeek" class="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-l-lg transition-colors" title="Minggu Sebelumnya">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"></path></svg>
                        </button>
                        <div class="px-4 py-2 border-x border-slate-200 text-sm font-bold text-slate-700">
                            {{ currentWeekLabel }}
                        </div>
                        <button @click="nextWeek" class="px-3 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-r-lg transition-colors" title="Minggu Berikutnya">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path></svg>
                        </button>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md">
                        {{ weekOffset === 0 ? 'Minggu ini' : (weekOffset > 0 ? `+${weekOffset} minggu` : `${weekOffset} minggu`) }}
                    </span>
                </div>
                
                <div class="flex flex-wrap items-center gap-2">
                    <span class="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-md">Shift 1 • 08.00 - 17.00</span>
                    <span class="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] font-bold px-2 py-1 rounded-md">Shift 2 • 16.00 - 00.00</span>
                    <span class="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-1 rounded-md">Shift 3 • 00.00 - 08.00</span>
                    <span class="bg-slate-50 text-slate-500 border border-slate-200 text-[10px] font-bold px-2 py-1 rounded-md">Libur</span>
                </div>
            </div>

            <!-- Table Card -->
            <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div class="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
                    <div>
                        <h3 class="text-lg font-bold text-slate-900">Penugasan karyawan</h3>
                        <p class="text-xs text-slate-500 mt-1">{{ filteredEmployees.length }} karyawan aktif • Waktu Indonesia Tengah (WITA)</p>
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
                                class="appearance-none bg-none pl-3.5 pr-10 py-2 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50/70 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-700 cursor-pointer transition-all">
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
                    <table class="w-full text-left text-sm whitespace-nowrap min-w-[980px]">
                        <thead class="bg-slate-50 border-b border-slate-100 text-[11px] text-slate-500">
                            <tr>
                                <th class="px-6 py-4 font-semibold w-56 min-w-[200px]">Karyawan</th>
                                <th v-for="day in weekDates" :key="day.date" class="px-2 py-4 font-semibold text-center w-28 min-w-[105px]">
                                    <div class="flex flex-col items-center">
                                        <span>{{ day.name }}</span>
                                        <span class="text-slate-900 font-bold text-xs mt-0.5">{{ day.date }}</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-slate-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-3">
                                        <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                                            {{ emp.name.split(' ').map(n => n[0]).join('') }}
                                        </div>
                                        <div>
                                            <p class="font-bold text-slate-900 text-sm">{{ emp.name }}</p>
                                            <p class="text-[11px] text-slate-400 mt-0.5">{{ emp.division }} • {{ emp.id }}</p>
                                        </div>
                                    </div>
                                </td>
                                <td v-for="(day, index) in weekDates" :key="index" class="px-2 py-4">
                                    <select :value="emp.schedule[index]" 
                                        @change="onShiftChange(emp.id, index, $event.target.value)"
                                        class="w-full min-w-[95px] border rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors shadow-2xs"
                                        :class="getShiftClass(emp.schedule[index])">
                                        <option v-for="s in shifts" :key="s" :value="s">{{ s }}</option>
                                    </select>
                                </td>
                            </tr>
                            <tr v-if="filteredEmployees.length === 0">
                                <td :colspan="weekDates.length + 1" class="px-6 py-12 text-center text-slate-400 text-xs">
                                    Tidak ada data penugasan karyawan yang sesuai dengan kriteria pencarian.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Table Footer -->
                <div class="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 bg-white">
                    <span>Menampilkan {{ filteredEmployees.length }} dari {{ employees.length }} karyawan</span>
                    <button @click="saveSchedule" class="text-blue-600 hover:text-blue-700 font-semibold hover:underline flex items-center gap-1">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        Simpan Perubahan Roster
                    </button>
                </div>
            </div>
            
        </div>
</template>
