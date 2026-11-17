<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { currentEmployee } from '@/stores/appState.js';

// Form states
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

// Password visibility toggles
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Error & Success feedback
const errorMessage = ref('');
const showToast = ref(false);
const toastMessage = ref('');
const isSubmitting = ref(false);

const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 4000);
};

// Validations
const isMinLength = computed(() => newPassword.value.length >= 6);
const isMatching = computed(() => newPassword.value && confirmPassword.value && newPassword.value === confirmPassword.value);
const isFormValid = computed(() => {
    return currentPassword.value && isMinLength.value && isMatching.value;
});

const submitPasswordChange = () => {
    errorMessage.value = '';

    if (!currentPassword.value) {
        errorMessage.value = 'Mohon masukkan kata sandi Anda saat ini.';
        return;
    }

    if (!isMinLength.value) {
        errorMessage.value = 'Kata sandi baru minimal harus terdiri dari 6 karakter.';
        return;
    }

    if (!isMatching.value) {
        errorMessage.value = 'Konfirmasi kata sandi baru tidak sesuai.';
        return;
    }

    isSubmitting.value = true;

    // Simulate reactive password update
    setTimeout(() => {
        isSubmitting.value = false;
        triggerToast('Kata sandi berhasil diperbarui! Gunakan sandi baru saat login berikutnya.');
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
    }, 600);
};
</script>

<template>
    <Head title="Ganti Password - Absensi Karyawan" />

    <div class="p-6 sm:p-8 max-w-4xl mx-auto w-full space-y-6 font-sans">
        
        <!-- Toast Notification -->
        <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce-subtle">
            <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="text-sm font-medium">{{ toastMessage }}</span>
        </div>

        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 class="text-2xl sm:text-[28px] font-extrabold text-slate-900 leading-tight">Ganti Password</h1>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">
                    Perbarui kata sandi akun karyawan Anda secara berkala untuk menjaga keamanan data akun.
                </p>
            </div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 self-start sm:self-auto">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                Keamanan Akun
            </span>
        </div>

        <!-- Employee Info Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
                <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs"
                    :class="currentEmployee?.avatarBg || 'bg-blue-600'">
                    {{ currentEmployee?.initials || 'EM' }}
                </div>
                <div>
                    <h3 class="font-bold text-base text-slate-900 leading-tight">{{ currentEmployee?.name }}</h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                        ID Karyawan: <span class="font-bold text-slate-700 font-mono">{{ currentEmployee?.id }}</span> • Divisi {{ currentEmployee?.division }}
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 text-[11px] font-bold rounded-md border"
                    :class="currentEmployee?.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'">
                    {{ currentEmployee?.isActive ? 'Akun Aktif' : 'Nonaktif' }}
                </span>
            </div>
        </div>

        <!-- Main Form Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            
            <div class="max-w-xl space-y-6">
                
                <!-- Error Alert -->
                <div v-if="errorMessage" class="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl font-medium flex items-start gap-2.5 shadow-2xs">
                    <svg class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <span>{{ errorMessage }}</span>
                </div>

                <form @submit.prevent="submitPasswordChange" class="space-y-5">
                    
                    <!-- Kata Sandi Lama / Saat Ini -->
                    <div>
                        <label for="current_password" class="block text-xs font-bold text-slate-800 mb-1.5">
                            Kata Sandi Saat Ini <span class="text-rose-500">*</span>
                        </label>
                        <div class="relative">
                            <input id="current_password" v-model="currentPassword" 
                                :type="showCurrentPassword ? 'text' : 'password'" required
                                placeholder="Masukkan kata sandi saat ini"
                                class="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800 placeholder:text-slate-400">
                            <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Tampilkan / sembunyikan kata sandi">
                                <svg v-if="!showCurrentPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Divider -->
                    <div class="border-t border-slate-100 pt-1"></div>

                    <!-- Kata Sandi Baru -->
                    <div>
                        <label for="new_password" class="block text-xs font-bold text-slate-800 mb-1.5">
                            Kata Sandi Baru <span class="text-rose-500">*</span>
                        </label>
                        <div class="relative">
                            <input id="new_password" v-model="newPassword" 
                                :type="showNewPassword ? 'text' : 'password'" required
                                placeholder="Masukkan minimal 6 karakter kata sandi baru"
                                class="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800 placeholder:text-slate-400">
                            <button type="button" @click="showNewPassword = !showNewPassword"
                                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Tampilkan / sembunyikan kata sandi">
                                <svg v-if="!showNewPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Konfirmasi Kata Sandi Baru -->
                    <div>
                        <label for="confirm_password" class="block text-xs font-bold text-slate-800 mb-1.5">
                            Konfirmasi Kata Sandi Baru <span class="text-rose-500">*</span>
                        </label>
                        <div class="relative">
                            <input id="confirm_password" v-model="confirmPassword" 
                                :type="showConfirmPassword ? 'text' : 'password'" required
                                placeholder="Ulangi kata sandi baru Anda"
                                class="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800 placeholder:text-slate-400">
                            <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                title="Tampilkan / sembunyikan kata sandi">
                                <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                            </button>
                        </div>
                    </div>

                    <!-- Live Validation Checklist -->
                    <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                        <p class="font-bold text-slate-700">Persyaratan kata sandi:</p>
                        <div class="flex items-center gap-2" :class="isMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'">
                            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="isMinLength ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01'"></path></svg>
                            <span>Panjang minimal 6 karakter</span>
                        </div>
                        <div class="flex items-center gap-2" :class="isMatching ? 'text-emerald-700 font-semibold' : 'text-slate-400'">
                            <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="isMatching ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01'"></path></svg>
                            <span>Konfirmasi kata sandi cocok</span>
                        </div>
                    </div>

                    <!-- Submit Button -->
                    <div class="pt-2 flex items-center gap-3">
                        <button type="submit" :disabled="!isFormValid || isSubmitting"
                            class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                            <svg v-if="isSubmitting" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                            </svg>
                            <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Kata Sandi' }}</span>
                        </button>
                    </div>
                </form>

            </div>

        </div>

        <!-- Help Notice Box -->
        <div class="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
                <h4 class="font-bold text-xs">Lupa kata sandi lama Anda?</h4>
                <p class="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                    Jika Anda lupa kata sandi lama, silakan hubungi <strong>Administrator Pabrik</strong> atau HRD untuk mereset kata sandi akun Anda ke sandi bawaan (default).
                </p>
            </div>
        </div>

    </div>
</template>
