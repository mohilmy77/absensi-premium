<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { 
    currentEmployee, 
    factorySettings, 
    todayEmployeeAttendance, 
    submitEmployeeAttendance, 
    submitEmployeeClockOut,
    calculateDistanceMeters
} from '@/stores/appState.js';

// Live Clock in WITA (Gorontalo Timezone)
const currentTime = ref('');
const currentDate = ref('');
let timer = null;

const updateTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    currentTime.value = `${hours}.${minutes}.${seconds}`;

    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    currentDate.value = now.toLocaleDateString('id-ID', options);
};

onMounted(() => {
    updateTime();
    timer = setInterval(updateTime, 1000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
    stopCamera();
});

// Toast notification
const toastMessage = ref('');
const showToast = ref(false);
const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 4000);
};

// --- GEOLOCATION (HTML5 & Haversine Geofencing) ---
const isCheckingLocation = ref(false);
const locationChecked = ref(false);
const inRadius = ref(false);
const currentDistance = ref(null);
const currentCoords = ref(null);
const locationMessage = ref('Lokasi belum diperiksa');
const locationSubMessage = ref('Klik tombol "Periksa Lokasi GPS" di bawah untuk memverifikasi area.');

const checkLocation = () => {
    if (!navigator.geolocation) {
        alert('Geolocation tidak didukung oleh browser Anda.');
        return;
    }

    isCheckingLocation.value = true;
    locationMessage.value = 'Mendeteksi titik koordinat GPS perangkat Anda...';
    locationSubMessage.value = 'Mohon izinkan akses lokasi jika browser meminta izin.';

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;
            currentCoords.value = { lat: userLat, lng: userLng };

            const distance = calculateDistanceMeters(
                userLat,
                userLng,
                factorySettings.value.lat,
                factorySettings.value.lng
            );
            currentDistance.value = distance;
            locationChecked.value = true;
            isCheckingLocation.value = false;

            if (distance <= factorySettings.value.radius) {
                inRadius.value = true;
                locationMessage.value = `Lokasi terverifikasi di dalam area pabrik (Jarak: ${distance}m / Maksimal: ${factorySettings.value.radius}m)`;
                locationSubMessage.value = `${factorySettings.value.name} • ${factorySettings.value.address}`;
                triggerToast('Lokasi GPS valid di area pabrik! Silakan ambil foto selfie.');
                
                // Jika kamera belum aktif dan belum ada foto, buka kamera otomatis
                if (!capturedPhoto.value && !cameraActive.value) {
                    startCamera();
                }
            } else {
                inRadius.value = false;
                locationMessage.value = `Di luar radius pabrik (Jarak: ${distance}m, Batas: ${factorySettings.value.radius}m)`;
                locationSubMessage.value = `Anda berada di luar koordinat pabrik. Anda belum diperbolehkan mengambil foto maupun melakukan absensi.`;
                triggerToast('Anda berada di luar radius pabrik!');
                stopCamera();
                capturedPhoto.value = null;
            }
        },
        (error) => {
            isCheckingLocation.value = false;
            locationChecked.value = true;
            inRadius.value = false;
            stopCamera();
            capturedPhoto.value = null;
            locationMessage.value = 'Gagal mengakses GPS: ' + (error.message || 'Izin lokasi tidak diberikan');
            locationSubMessage.value = 'Pastikan GPS/lokasi pada perangkat dan browser Anda aktif, lalu coba lagi.';
            triggerToast('Gagal memverifikasi lokasi GPS.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
};

// --- CAMERA (HTML5 MediaDevices & Canvas Snapshot) ---
const videoElement = ref(null);
const canvasElement = ref(null);
const videoStream = ref(null);
const cameraActive = ref(false);
const cameraLoading = ref(false);
const cameraError = ref(null);
const capturedPhoto = ref(null);

const startCamera = async () => {
    // SYARAT MUTLAK: Harus di dalam radius pabrik terlebih dahulu!
    if (!locationChecked.value || !inRadius.value) {
        triggerToast('Pemeriksaan lokasi wajib lulus terlebih dahulu sebelum kamera dapat digunakan.');
        return;
    }

    cameraLoading.value = true;
    cameraError.value = null;
    capturedPhoto.value = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        cameraError.value = 'Peramban web tidak mendukung akses kamera HTML5.';
        cameraLoading.value = false;
        return;
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 640 },
                height: { ideal: 480 },
            },
            audio: false,
        });

        videoStream.value = stream;
        cameraActive.value = true;
        cameraLoading.value = false;

        setTimeout(() => {
            if (videoElement.value) {
                videoElement.value.srcObject = stream;
                videoElement.value.play().catch(e => console.warn('Autoplay error:', e));
            }
        }, 100);
    } catch (err) {
        console.warn('Camera access error:', err);
        cameraLoading.value = false;
        cameraActive.value = false;
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            cameraError.value = 'Izin kamera ditolak oleh browser. Mohon izinkan akses kamera di pengaturan browser.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            cameraError.value = 'Tidak ada perangkat kamera/webcam yang terdeteksi.';
        } else {
            cameraError.value = 'Gagal mengakses webcam: ' + (err.message || 'Error tidak diketahui');
        }
    }
};

const stopCamera = () => {
    if (videoStream.value) {
        videoStream.value.getTracks().forEach(track => track.stop());
        videoStream.value = null;
    }
    cameraActive.value = false;
    cameraLoading.value = false;
};

const takePhoto = () => {
    if (!videoElement.value || !canvasElement.value) {
        triggerToast('Kamera belum siap.');
        return;
    }

    const video = videoElement.value;
    const canvas = canvasElement.value;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    // Mirror image untuk kamera depan
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Overlay digital watermark resmi
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fillRect(0, height - 42, width, 42);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px monospace';
    ctx.fillText(`${currentTime.value} WITA • ${currentDate.value}`, 16, height - 16);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('LIVE SELFIE VERIFIED', width - 16, height - 16);

    capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    triggerToast('Foto selfie berhasil diambil!');
};

const retakePhoto = () => {
    capturedPhoto.value = null;
    cameraError.value = null;
    startCamera();
};

// --- ATTENDANCE ACTIONS ---
const todayAttendance = computed(() => todayEmployeeAttendance.value);

const hasCheckedIn = computed(() => {
    return todayAttendance.value && todayAttendance.value.timeIn && todayAttendance.value.timeIn !== '-';
});

const hasCheckedOut = computed(() => {
    return todayAttendance.value && todayAttendance.value.timeOut && todayAttendance.value.timeOut !== '-';
});

const attendanceStatusBadge = computed(() => {
    if (hasCheckedOut.value) return 'Sudah pulang';
    if (hasCheckedIn.value) return 'Sudah masuk';
    return 'Belum masuk';
});

const doClockIn = () => {
    if (!locationChecked.value || !inRadius.value) {
        alert('Anda belum berada di dalam radius pabrik! Absensi hanya dapat dilakukan jika lokasi Anda sesuai dengan radius pabrik.');
        return;
    }
    if (!capturedPhoto.value) {
        alert('Wajib mengambil foto selfie dari kamera sebelum melakukan presensi masuk!');
        return;
    }

    const rec = submitEmployeeAttendance({
        employeeId: currentEmployee.value.id,
        timeIn: currentTime.value.substring(0, 5),
        photo: capturedPhoto.value,
        lat: currentCoords.value?.lat || factorySettings.value.lat,
        lng: currentCoords.value?.lng || factorySettings.value.lng,
        distanceMeters: currentDistance.value || 0,
    });

    triggerToast(`Presensi masuk berhasil! Status: ${rec.status} (${rec.points} poin).`);
};

const doClockOut = () => {
    if (!locationChecked.value || !inRadius.value) {
        alert('Anda belum berada di dalam radius pabrik! Absen pulang hanya dapat dilakukan jika lokasi Anda berada di dalam radius pabrik.');
        return;
    }

    const timeOutStr = currentTime.value.substring(0, 5);
    submitEmployeeClockOut({
        employeeId: currentEmployee.value.id,
        timeOut: timeOutStr,
    });
    triggerToast(`Presensi pulang pukul ${timeOutStr} WITA berhasil dicatat! Terima kasih atas kerja keras Anda.`);
};
</script>

<template>
    <Head title="Absensi Saya - Premium Es Kristal" />

    <div class="p-6 sm:p-8 max-w-7xl mx-auto w-full space-y-6">
            
            <!-- Toast Notification -->
            <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce-subtle">
                <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="text-sm font-medium">{{ toastMessage }}</span>
            </div>

            <!-- Page Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Absensi</h1>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">
                        Presensi mandiri karyawan dengan verifikasi radius lokasi pabrik dan foto selfie kamera live.
                    </p>
                </div>
                <span class="px-3 py-1 text-xs font-semibold rounded-md border"
                    :class="{
                        'bg-emerald-50 text-emerald-700 border-emerald-200': hasCheckedOut,
                        'bg-sky-50 text-sky-700 border-sky-200': hasCheckedIn && !hasCheckedOut,
                        'bg-amber-50 text-amber-700 border-amber-200': !hasCheckedIn,
                    }">
                    {{ attendanceStatusBadge }}
                </span>
            </div>

            <!-- Main Attendance Card -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 max-w-4xl shadow-xs">
                
                <!-- Card Header -->
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900">Presensi hari ini</h2>
                        <p class="text-xs text-slate-500 mt-0.5">{{ currentEmployee.name }} • Divisi {{ currentEmployee.division }}</p>
                    </div>
                    <span class="text-xs font-semibold px-2.5 py-1 rounded-md border"
                        :class="{
                            'bg-emerald-50 text-emerald-700 border-emerald-200': hasCheckedOut,
                            'bg-sky-50 text-sky-700 border-sky-200': hasCheckedIn && !hasCheckedOut,
                            'bg-amber-50 text-amber-700 border-amber-200': !hasCheckedIn,
                        }">
                        {{ attendanceStatusBadge }}
                    </span>
                </div>

                <!-- Clock Display -->
                <div class="mt-2 mb-6">
                    <div class="flex items-baseline gap-2">
                        <span class="text-4xl sm:text-[44px] font-black text-slate-900 leading-none tracking-tight">{{ currentTime }}</span>
                        <span class="text-sm font-bold text-slate-500">WITA</span>
                    </div>
                    <p class="text-sm text-slate-500 mt-1.5">{{ currentDate }}</p>
                </div>

                <!-- Shift Banner -->
                <div class="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between mb-6">
                    <div class="flex items-center gap-2 text-blue-800 font-semibold text-sm">
                        <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>Shift 1 (Operasional Pagi)</span>
                    </div>
                    <div class="text-sm text-blue-800 font-medium">08.00 – 17.00 WITA</div>
                </div>

                <!-- Step Tracker Flow Indicator -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <!-- Step 1 Tracker -->
                    <div class="p-3 rounded-xl border flex items-center gap-3 transition-colors"
                        :class="inRadius ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : (locationChecked ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-blue-50 border-blue-200 text-blue-800')">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                            :class="inRadius ? 'bg-emerald-600 text-white' : (locationChecked ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white')">
                            <svg v-if="inRadius" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                            <svg v-else-if="locationChecked" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                            <span v-else>1</span>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-bold leading-tight">1. Periksa Lokasi</p>
                            <p class="text-[11px] opacity-80 truncate">{{ inRadius ? 'Sesuai Radius' : (locationChecked ? 'Di Luar Radius' : 'Wajib Periksa') }}</p>
                        </div>
                    </div>

                    <!-- Step 2 Tracker -->
                    <div class="p-3 rounded-xl border flex items-center gap-3 transition-colors"
                        :class="capturedPhoto ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : (inRadius ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-400')">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                            :class="capturedPhoto ? 'bg-emerald-600 text-white' : (inRadius ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500')">
                            <svg v-if="capturedPhoto" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                            <span v-else>2</span>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-bold leading-tight">2. Foto Selfie</p>
                            <p class="text-[11px] opacity-80 truncate">{{ capturedPhoto ? 'Foto Siap' : (inRadius ? 'Kamera Dibuka' : 'Terkunci') }}</p>
                        </div>
                    </div>

                    <!-- Step 3 Tracker -->
                    <div class="p-3 rounded-xl border flex items-center gap-3 transition-colors"
                        :class="hasCheckedIn ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ((inRadius && capturedPhoto) ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-400')">
                        <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
                            :class="hasCheckedIn ? 'bg-emerald-600 text-white' : ((inRadius && capturedPhoto) ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500')">
                            <svg v-if="hasCheckedIn" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                            <span v-else>3</span>
                        </div>
                        <div class="min-w-0">
                            <p class="text-xs font-bold leading-tight">3. Kirim Presensi</p>
                            <p class="text-[11px] opacity-80 truncate">{{ hasCheckedIn ? 'Selesai' : ((inRadius && capturedPhoto) ? 'Siap Kirim' : 'Menunggu') }}</p>
                        </div>
                    </div>
                </div>

                <!-- Camera Viewfinder Box -->
                <div class="aspect-video w-full bg-slate-900 rounded-xl border border-slate-300 flex flex-col items-center justify-center mb-6 relative overflow-hidden group shadow-inner">
                    
                    <!-- Hidden Canvas for Snapshot Capture -->
                    <canvas ref="canvasElement" class="hidden"></canvas>

                    <!-- VIEW STATE 1: Foto berhasil diambil -->
                    <div v-if="capturedPhoto" class="relative w-full h-full flex items-center justify-center bg-black">
                        <img :src="capturedPhoto" alt="Selfie Absensi" class="w-full h-full object-cover" />
                        <div class="absolute top-3 right-3 flex items-center gap-2">
                            <button @click="retakePhoto" class="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg backdrop-blur-xs flex items-center gap-1.5 transition-colors">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                <span>Ambil Ulang</span>
                            </button>
                        </div>
                        <div class="absolute bottom-3 left-3 bg-emerald-600/90 text-white text-xs font-bold px-3 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                            <span>Foto Kamera Asli Siap untuk Absensi</span>
                        </div>
                    </div>

                    <!-- VIEW STATE 2: Kamera Live Aktif (Hanya bisa dibuka jika inRadius == true) -->
                    <div v-else-if="cameraActive" class="relative w-full h-full flex items-center justify-center bg-black">
                        <video ref="videoElement" autoplay playsinline muted class="w-full h-full object-cover transform -scale-x-100"></video>
                        
                        <!-- Face Oval Alignment Guide -->
                        <div class="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div class="w-44 h-60 border-2 border-dashed border-sky-400 rounded-full flex flex-col items-center justify-end pb-4 bg-sky-500/10 shadow-2xl">
                                <span class="bg-slate-900/80 text-sky-200 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                                    Posisikan Wajah Anda
                                </span>
                            </div>
                        </div>

                        <!-- Camera Action Bar Overlay -->
                        <div class="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-20">
                            <button @click="stopCamera" class="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg backdrop-blur-xs transition-colors">
                                Tutup Kamera
                            </button>
                            <button @click="takePhoto" class="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                                <span>Ambil Foto Selfie</span>
                            </button>
                        </div>
                    </div>

                    <!-- VIEW STATE 3: Lokasi belum diperiksa (Kamera Terkunci) -->
                    <div v-else-if="!locationChecked" class="text-center p-8 flex flex-col items-center justify-center space-y-3">
                        <div class="w-16 h-16 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-sky-400">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-base font-bold text-white">Langkah 1: Periksa Lokasi Terlebih Dahulu</p>
                            <p class="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                                Kamera selfie akan otomatis terbuka setelah sistem memverifikasi bahwa koordinat GPS Anda berada di dalam radius pabrik.
                            </p>
                        </div>
                        <div class="pt-2">
                            <button @click="checkLocation" :disabled="isCheckingLocation" 
                                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                <span>{{ isCheckingLocation ? 'Memeriksa Lokasi GPS...' : '📍 Periksa Lokasi GPS Sekarang' }}</span>
                            </button>
                        </div>
                    </div>

                    <!-- VIEW STATE 4: Lokasi Di Luar Radius (Kamera Ditolak / Dilarang) -->
                    <div v-else-if="locationChecked && !inRadius" class="text-center p-8 flex flex-col items-center justify-center space-y-3 bg-rose-950/40 w-full h-full">
                        <div class="w-16 h-16 rounded-full bg-rose-900/60 border border-rose-700/80 flex items-center justify-center text-rose-400 animate-pulse">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                            </svg>
                        </div>
                        <div>
                            <p class="text-base font-bold text-rose-200">Di Luar Radius Pabrik</p>
                            <p class="text-xs text-rose-300/90 max-w-md mt-1.5 leading-relaxed">
                                Anda terdeteksi berjarak <strong class="text-white">{{ currentDistance !== null ? currentDistance + ' meter' : 'jauh' }}</strong> dari pabrik (Batas toleransi: {{ factorySettings.radius }} meter). 
                                Anda <strong>belum boleh mengambil foto</strong> dan <strong>belum boleh melakukan absensi</strong>.
                            </p>
                        </div>
                        <div class="pt-2">
                            <button @click="checkLocation" :disabled="isCheckingLocation" 
                                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-colors">
                                <svg class="w-3.5 h-3.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                                <span>Periksa Ulang Lokasi GPS</span>
                            </button>
                        </div>
                    </div>

                    <!-- VIEW STATE 5: Lokasi Dalam Radius & Siap Buka Kamera -->
                    <div v-else class="text-center p-8 flex flex-col items-center justify-center space-y-3">
                        <div class="w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                        </div>
                        <div>
                            <p class="text-base font-bold text-white">Lokasi Valid di Area Pabrik</p>
                            <p class="text-xs text-slate-300 mt-1">Jarak Anda {{ currentDistance }} meter. Silakan aktifkan kamera untuk mengambil foto selfie.</p>
                        </div>
                        <div v-if="cameraError" class="max-w-md bg-rose-500/20 text-rose-300 text-xs px-3 py-2 rounded-lg border border-rose-500/30">
                            {{ cameraError }}
                        </div>
                        <div class="pt-2">
                            <button @click="startCamera" :disabled="cameraLoading" 
                                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                <span>{{ cameraLoading ? 'Membuka Kamera...' : 'Buka Kamera Selfie' }}</span>
                            </button>
                        </div>
                    </div>

                </div>

                <!-- Action Bar & Geolocation Status -->
                <div class="space-y-4 mb-6">
                    <div class="flex flex-wrap items-center gap-3">
                        <!-- Periksa Lokasi Button -->
                        <button @click="checkLocation" :disabled="isCheckingLocation" 
                            class="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-xs disabled:opacity-50">
                            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>{{ isCheckingLocation ? 'Memeriksa GPS...' : 'Periksa Lokasi GPS' }}</span>
                        </button>
                        
                        <!-- Absen Masuk Button (Active only when inRadius AND capturedPhoto exists) -->
                        <button v-if="!hasCheckedIn" @click="doClockIn" 
                            :disabled="!inRadius || !capturedPhoto"
                            class="font-semibold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm shadow-xs"
                            :class="inRadius && capturedPhoto ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                            <span>Absen Masuk</span>
                        </button>

                        <!-- Absen Pulang Button (Active only when inRadius) -->
                        <button v-else-if="!hasCheckedOut" @click="doClockOut" 
                            :disabled="!inRadius"
                            class="font-semibold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 text-sm shadow-xs"
                            :class="inRadius ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            <span>Absen Pulang</span>
                        </button>

                        <!-- Completed Badge -->
                        <div v-else class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
                            <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                            <span>Presensi Lengkap (Hari Ini Selesai)</span>
                        </div>
                    </div>

                    <!-- Location Status Indicator Details -->
                    <div class="p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors"
                        :class="inRadius ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' : (locationChecked ? 'bg-rose-50/80 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-600')">
                        <svg class="w-4 h-4 mt-0.5 shrink-0" :class="inRadius ? 'text-emerald-600' : (locationChecked ? 'text-rose-600' : 'text-slate-400')" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <div class="space-y-0.5">
                            <p class="font-bold">{{ locationMessage }}</p>
                            <p v-if="locationSubMessage" class="opacity-80">{{ locationSubMessage }}</p>
                        </div>
                    </div>
                </div>

                <!-- History Footer Inside Card -->
                <div class="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-6 sm:gap-8 text-sm">
                    <div class="text-slate-500">
                        Masuk: <span class="text-slate-900 font-bold ml-1.5">{{ todayAttendance?.timeIn || '—' }}</span>
                        <span v-if="todayAttendance?.status" class="ml-1.5 text-xs font-semibold px-2 py-0.5 rounded"
                            :class="todayAttendance.status === 'Tepat waktu' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'">
                            {{ todayAttendance.status }}
                        </span>
                    </div>
                    <div class="text-slate-500">
                        Pulang: <span class="text-slate-900 font-bold ml-1.5">{{ todayAttendance?.timeOut || '—' }}</span>
                    </div>
                    <div v-if="todayAttendance?.points" class="text-slate-500 sm:ml-auto">
                        Poin didapat: <span class="font-bold text-blue-600">{{ todayAttendance.points }}</span>
                    </div>
                </div>

            </div>

    </div>
</template>
