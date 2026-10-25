<script setup>
import { Head, Link, useForm } from '@inertiajs/vue3';
import { ref } from 'vue';

const props = defineProps({
    canResetPassword: {
        type: Boolean,
    },
    status: {
        type: String,
    },
});

const selectedRole = ref('karyawan'); // 'karyawan' | 'admin'
const showPassword = ref(false);

const form = useForm({
    email: '',
    password: '',
    remember: false,
    role: selectedRole.value,
});

const selectRole = (role) => {
    selectedRole.value = role;
    form.role = role;
    // Set appropriate placeholder defaults or reset
    if (role === 'admin') {
        form.email = 'admin@eskristal.com';
    } else {
        form.email = 'PDX-001';
    }
};

const submit = () => {
    form.role = selectedRole.value;
    form.post(route('login'), {
        onFinish: () => form.reset('password'),
    });
};
</script>

<template>
    <Head title="Masuk - Premium Es Kristal" />

    <div class="min-h-screen bg-slate-50 text-slate-800 font-sans flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        
        <!-- Subtle Ambient Background Accents -->
        <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-100/70 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-100/70 rounded-full blur-3xl pointer-events-none"></div>

        <div class="max-w-5xl w-full bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-blue-500/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
            
            <!-- Left Side: Branding & Feature Showcase (5 Cols) -->
            <div class="lg:col-span-5 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-slate-50 p-8 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-100 relative">
                
                <!-- Background Geometric Ice Accent -->
                <div class="absolute top-0 right-0 w-48 h-48 bg-blue-100/40 rounded-full blur-2xl pointer-events-none"></div>

                <!-- Brand Header -->
                <div class="relative z-10">
                    <div class="flex items-center gap-3.5 mb-8">
                        <img src="/images/logo-premium.png" alt="Logo Premium Kristal" class="w-12 h-12 object-contain shrink-0 rounded-xl" />
                        <div>
                            <h1 class="text-base font-extrabold text-slate-900 leading-tight">Premium<br>Es Kristal</h1>
                            <p class="text-[9px] text-blue-600 font-bold tracking-wider">ABSENSI KARYAWAN</p>
                        </div>
                    </div>

                    <!-- Hero Tagline -->
                    <div class="space-y-3 mb-8">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100/80 text-blue-700 border border-blue-200">
                            <span class="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                            Sistem Absensi & Payroll 24 Jam
                        </span>
                        <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                            Presensi Digital Terverifikasi & Transparan
                        </h2>
                        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                            Mendukung operasional pabrik 3 shift dengan validasi live selfie camera dan GPS geofencing presisi tinggi di Gorontalo (WITA).
                        </p>
                    </div>

                    <!-- Core Feature Pills -->
                    <div class="space-y-2.5">
                        <div class="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-xs">
                            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-800">Geofencing Pabrik Real-time</p>
                                <p class="text-[11px] text-slate-500">Radius toleransi 100m di area pabrik</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-xs">
                            <div class="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path></svg>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-800">Live Camera Selfie Anti-Titip</p>
                                <p class="text-[11px] text-slate-500">Pengambilan foto langsung tanpa unggah lokal</p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-xs rounded-xl border border-slate-200/80 shadow-xs">
                            <div class="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-800">Payroll Otomatis & Poin Reward</p>
                                <p class="text-[11px] text-slate-500">Akumulasi upah dan bonus kedisiplinan</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Left Footer Info -->
                <div class="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span class="flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Operasional 24 Jam
                    </span>
                    <span class="font-semibold text-slate-600">Zona Waktu WITA</span>
                </div>
            </div>

            <!-- Right Side: Clean Login Form (7 Cols) -->
            <div class="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
                
                <div class="max-w-md w-full mx-auto space-y-6">
                    
                    <!-- Form Header -->
                    <div>
                        <h3 class="text-2xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h3>
                        <p class="text-xs text-slate-500 mt-1">Pilih peran akun dan masukkan data kredensial Anda untuk masuk.</p>
                    </div>

                    <!-- Status Notification if any -->
                    <div v-if="status" class="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-xl font-medium">
                        {{ status }}
                    </div>

                    <!-- Role Switcher Segmented Control -->
                    <div>
                        <label class="block text-xs font-bold text-slate-700 mb-2">Pilih Peran Akun</label>
                        <div class="p-1 bg-slate-100 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-1">
                            <button type="button" @click="selectRole('karyawan')"
                                class="py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                :class="selectedRole === 'karyawan' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                <span>Karyawan</span>
                            </button>

                            <button type="button" @click="selectRole('admin')"
                                class="py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                                :class="selectedRole === 'admin' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                <span>Administrator</span>
                            </button>
                        </div>
                    </div>

                    <!-- Login Form -->
                    <form @submit.prevent="submit" class="space-y-4">
                        
                        <!-- Identifier Input -->
                        <div>
                            <label for="email" class="block text-xs font-semibold text-slate-700 mb-1.5">
                                {{ selectedRole === 'karyawan' ? 'ID Karyawan / NIK' : 'Email Administrator' }}
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path v-if="selectedRole === 'karyawan'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                                <input id="email" v-model="form.email" type="text" required autofocus autocomplete="username"
                                    :placeholder="selectedRole === 'karyawan' ? 'Contoh: PDX-001' : 'admin@eskristal.com'"
                                    class="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800">
                            </div>
                            <p v-if="form.errors.email" class="text-rose-500 text-[11px] mt-1">{{ form.errors.email }}</p>
                        </div>

                        <!-- Password Input -->
                        <div>
                            <div class="flex items-center justify-between mb-1.5">
                                <label for="password" class="block text-xs font-semibold text-slate-700">Kata Sandi</label>
                                <a v-if="canResetPassword" :href="route('password.request')" class="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                    Lupa kata sandi?
                                </a>
                            </div>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <input id="password" v-model="form.password" :type="showPassword ? 'text' : 'password'" required autocomplete="current-password"
                                    placeholder="••••••••"
                                    class="w-full pl-10 pr-10 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800">
                                <button type="button" @click="showPassword = !showPassword"
                                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600">
                                    <svg v-if="!showPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                                </button>
                            </div>
                            <p v-if="form.errors.password" class="text-rose-500 text-[11px] mt-1">{{ form.errors.password }}</p>
                        </div>

                        <!-- Remember Me Checkbox -->
                        <div class="flex items-center">
                            <input id="remember" v-model="form.remember" type="checkbox"
                                class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer">
                            <label for="remember" class="ml-2 text-xs text-slate-600 cursor-pointer">
                                Ingat saya di perangkat ini
                            </label>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" :disabled="form.processing"
                            class="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                            <svg v-if="form.processing" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>{{ form.processing ? 'Memproses...' : 'Masuk ke Sistem' }}</span>
                        </button>
                    </form>

                    <!-- Fast Direct Demo Access Links (Frontend Preview Helper) -->
                    <div class="pt-4 border-t border-slate-100">
                        <p class="text-[11px] font-semibold text-slate-500 text-center mb-2.5">Akses Cepat Pratinjau Tampilan:</p>
                        <div class="grid grid-cols-2 gap-2">
                            <Link href="/employee"
                                class="px-3 py-2 rounded-xl text-center border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                                <span>Portal Karyawan</span>
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </Link>

                            <Link href="/admin"
                                class="px-3 py-2 rounded-xl text-center border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                                <span>Portal Admin</span>
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                            </Link>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    </div>
</template>
