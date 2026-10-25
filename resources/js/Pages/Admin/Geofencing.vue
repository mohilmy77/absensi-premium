<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, onMounted } from 'vue';
import { factorySettings, saveFactoryGeofence } from '@/stores/appState.js';

// Factory configuration state from shared store
const factoryName = ref(factorySettings.value.name);
const factoryAddress = ref(factorySettings.value.address);
const timezone = ref(factorySettings.value.timezone);

const location = ref({
    lat: factorySettings.value.lat,
    lng: factorySettings.value.lng,
    radius: factorySettings.value.radius,
});

onMounted(() => {
    factoryName.value = factorySettings.value.name;
    factoryAddress.value = factorySettings.value.address;
    location.value.lat = factorySettings.value.lat;
    location.value.lng = factorySettings.value.lng;
    location.value.radius = factorySettings.value.radius;
});

// Toast & feedback state
const showToast = ref(false);
const toastMessage = ref('');
const isSaving = ref(false);
const isLocating = ref(false);

const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3500);
};

// Use current device location
const useCurrentLocation = () => {
    if (!navigator.geolocation) {
        triggerToast('Geolocation tidak didukung oleh browser Anda.');
        return;
    }

    isLocating.value = true;
    navigator.geolocation.getCurrentPosition(
        (position) => {
            location.value.lat = parseFloat(position.coords.latitude.toFixed(6));
            location.value.lng = parseFloat(position.coords.longitude.toFixed(6));
            isLocating.value = false;
            triggerToast('Koordinat GPS perangkat saat ini berhasil diterapkan ke form!');
        },
        (error) => {
            isLocating.value = false;
            triggerToast('Izin lokasi ditolak oleh browser. Menggunakan titik default pabrik Gorontalo.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
};

// Set preset radius
const setRadiusPreset = (val) => {
    location.value.radius = val;
};

// Save settings action
const saveSettings = () => {
    isSaving.value = true;
    saveFactoryGeofence({
        name: factoryName.value,
        address: factoryAddress.value,
        lat: location.value.lat,
        lng: location.value.lng,
        radius: location.value.radius,
        timezone: timezone.value,
    });
    setTimeout(() => {
        isSaving.value = false;
        triggerToast('Pengaturan pabrik & radius geofencing berhasil disimpan dan aktif!');
    }, 400);
};

// Circle size scaling calculation for visual preview
const circleScalePx = computed(() => {
    // Map radius (10 - 1000m) to container scale (80px - 280px)
    const minPx = 90;
    const maxPx = 280;
    const normalized = (location.value.radius - 10) / (1000 - 10);
    return Math.round(minPx + normalized * (maxPx - minPx));
});

// 3 Operational Shifts (PRD Compliant)
const shifts = [
    {
        name: 'Shift 1',
        time: '08.00 - 17.00 WITA',
        duration: '9 Jam (8 Jam Kerja + 1 Jam Istirahat)',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-800',
        dot: 'bg-emerald-500',
    },
    {
        name: 'Shift 2',
        time: '16.00 - 00.00 WITA',
        duration: '8 Jam Kerja (Overlap 1 jam handover)',
        bg: 'bg-sky-50',
        border: 'border-sky-200',
        text: 'text-sky-800',
        dot: 'bg-sky-500',
    },
    {
        name: 'Shift 3',
        time: '00.00 - 08.00 WITA',
        duration: '8 Jam Kerja (Operasional lintas malam)',
        bg: 'bg-indigo-50',
        border: 'border-indigo-200',
        text: 'text-indigo-800',
        dot: 'bg-indigo-500',
    },
];
</script>

<template>
    <Head title="Pengaturan Pabrik" />

    <div class="p-8 max-w-[1600px] mx-auto w-full space-y-6">

            <!-- Toast Notification -->
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-3">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-sm font-medium">{{ toastMessage }}</span>
            </div>

            <!-- Page Header -->
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">Pengaturan pabrik</h1>
                    <p class="text-slate-500 mt-1">Tentukan area presensi yang valid untuk seluruh karyawan.</p>
                </div>
                <div class="flex items-center gap-3">
                    <button @click="saveSettings" :disabled="isSaving"
                        class="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-60">
                        <svg v-if="!isSaving" class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                        </svg>
                        <svg v-else class="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>{{ isSaving ? 'Menyimpan...' : 'Simpan pengaturan' }}</span>
                    </button>
                </div>
            </div>

            <!-- Main Settings Container (2 Columns) -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                <!-- Left Column: Form Settings -->
                <div class="lg:col-span-6 space-y-6">
                    <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 leading-tight">Lokasi & geofencing</h2>
                            <p class="text-xs text-slate-500 mt-0.5">{{ factoryName }}</p>
                        </div>

                        <!-- Latitude & Longitude Inputs -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Latitude</label>
                                <input v-model="location.lat" type="text"
                                    class="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1.5">Longitude</label>
                                <input v-model="location.lng" type="text"
                                    class="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800">
                            </div>
                        </div>

                        <!-- Use Current Location Button -->
                        <div>
                            <button @click="useCurrentLocation" :disabled="isLocating"
                                class="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition-colors disabled:opacity-60">
                                <svg class="w-4 h-4 text-slate-500" :class="{'animate-spin': isLocating}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"></path>
                                </svg>
                                <span>{{ isLocating ? 'Mendeteksi GPS...' : 'Gunakan lokasi saat ini' }}</span>
                            </button>
                        </div>

                        <!-- Radius Section -->
                        <div class="pt-2 border-t border-slate-100">
                            <label class="block text-xs font-semibold text-slate-700 mb-2">Radius toleransi presensi</label>
                            
                            <div class="flex items-center gap-3 mb-3">
                                <div class="relative w-28">
                                    <input v-model.number="location.radius" type="number" min="10" max="1000"
                                        class="w-full pl-3 pr-2 py-2 text-sm font-bold font-mono border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800">
                                </div>
                                <span class="text-xs text-slate-500 font-medium">meter</span>

                                <!-- Quick Presets -->
                                <div class="ml-auto flex items-center gap-1.5">
                                    <button v-for="preset in [50, 100, 200, 500]" :key="preset" @click="setRadiusPreset(preset)"
                                        class="px-2.5 py-1 text-[11px] rounded-lg border font-medium transition-colors"
                                        :class="location.radius === preset ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'">
                                        {{ preset }}m
                                    </button>
                                </div>
                            </div>

                            <!-- Range Slider -->
                            <div class="space-y-1">
                                <input v-model.number="location.radius" type="range" min="10" max="1000" step="5"
                                    class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600">
                                <div class="flex justify-between text-[11px] text-slate-400 font-medium px-0.5">
                                    <span>10 m</span>
                                    <span>1.000 m</span>
                                </div>
                            </div>
                        </div>

                        <!-- Initial Info Banner -->
                        <div class="p-3 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
                            <svg class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Titik koordinat pabrik resmi terverifikasi: Jl. Imam Bonjol, Kota Gorontalo (0.539716, 123.058278).</span>
                        </div>

                    </div>
                </div>

                <!-- Right Column: Interactive Map & Geofence Canvas -->
                <div class="lg:col-span-6 space-y-4">
                    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                        
                        <!-- Canvas Header Tag -->
                        <div class="flex items-center justify-between mb-4">
                            <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">Visualisasi Geofence</span>
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Toleransi {{ location.radius }}m Aktif
                            </span>
                        </div>

                        <!-- Radar Map Container -->
                        <div class="relative w-full h-[360px] rounded-2xl bg-[#f2fbf7] border border-emerald-100 overflow-hidden flex items-center justify-center select-none shadow-inner">
                            
                            <!-- Subtle Grid Background -->
                            <div class="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#05966915_1px,transparent_1px),linear-gradient(to_bottom,#05966915_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                            
                            <!-- Static Center Grid Lines -->
                            <div class="absolute w-full h-[1px] bg-emerald-500/10"></div>
                            <div class="absolute h-full w-[1px] bg-emerald-500/10"></div>

                            <!-- Animated Radar Ring Effect -->
                            <div class="absolute w-64 h-64 rounded-full border border-emerald-500/20 pointer-events-none"></div>
                            <div class="absolute w-80 h-80 rounded-full border border-emerald-500/10 pointer-events-none"></div>

                            <!-- Interactive Dynamic Geofence Area -->
                            <div class="absolute rounded-full border-2 border-dashed border-emerald-600 bg-emerald-500/10 flex flex-col items-center justify-center transition-all duration-300 pointer-events-none shadow-sm"
                                :style="{ width: `${circleScalePx}px`, height: `${circleScalePx}px` }">
                                
                                <!-- Factory Center Pin -->
                                <div class="w-10 h-10 rounded-full bg-white border border-emerald-200 shadow-sm flex items-center justify-center text-emerald-700 mb-1.5 shrink-0">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>

                                <!-- Text Inside Circle -->
                                <p class="text-xs font-bold text-slate-800 text-center leading-tight">Premium Es Kristal</p>
                                <p class="text-[10px] font-semibold text-emerald-700 text-center mt-0.5">Radius {{ location.radius }} meter</p>
                            </div>

                            <!-- Coordinates Pill Badge at Bottom Center -->
                            <div class="absolute bottom-4 px-3 py-1 bg-white/95 backdrop-blur-xs rounded-full border border-slate-200 shadow-xs text-[11px] font-mono font-medium text-slate-600 flex items-center gap-1.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                {{ location.lat }}, {{ location.lng }}
                            </div>

                        </div>

                        <!-- Map Footnote -->
                        <div class="flex items-center gap-2 mt-4 text-xs text-slate-600">
                            <svg class="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>Presensi hanya dapat dilakukan di dalam radius yang ditentukan, dengan foto selfie langsung dari kamera.</span>
                        </div>

                    </div>
                </div>

            </div>

            <!-- Jam Operasional Section -->
            <div class="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div>
                    <h2 class="text-base font-bold text-slate-900">Jam operasional</h2>
                    <p class="text-xs text-slate-500 mt-0.5">Zona waktu WITA - Asia/Gorontalo</p>
                </div>

                <!-- 3 Shifts Grid -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div v-for="shift in shifts" :key="shift.name"
                        class="p-4 rounded-xl border flex flex-col justify-between"
                        :class="[shift.bg, shift.border]">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-xs font-bold tracking-wide" :class="shift.text">{{ shift.name }}</span>
                            <span class="w-2 h-2 rounded-full" :class="shift.dot"></span>
                        </div>
                        <div>
                            <p class="text-lg font-extrabold text-slate-900 tracking-tight">{{ shift.time }}</p>
                            <p class="text-[11px] text-slate-500 mt-1">{{ shift.duration }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <div class="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
                <div>© 2026 Premium Es Kristal. Semua hak dilindungi.</div>
                <div class="flex items-center gap-4">
                    <span>Sistem Validasi Absensi Geofencing GPS & Live Camera</span>
                </div>
            </div>

        </div>
</template>
