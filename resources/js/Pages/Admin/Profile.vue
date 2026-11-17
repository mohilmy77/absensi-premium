<script setup>
import { Head } from '@inertiajs/vue3';
import { ref, computed } from 'vue';
import { adminProfile, updateAdminProfile } from '@/stores/appState.js';

// Profile Form State
const profileForm = ref({
    name: adminProfile.value.name,
    email: adminProfile.value.email,
});

// Password Form State
const passwordForm = ref({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
});

// Password Visibility Toggles
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Toast & Feedback
const showToast = ref(false);
const toastMessage = ref('');
const profileError = ref('');
const passwordError = ref('');

const isSavingProfile = ref(false);
const isSavingPassword = ref(false);

const triggerToast = (msg) => {
    toastMessage.value = msg;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 4000);
};

// Validation for Password
const isPasswordMinLength = computed(() => passwordForm.value.newPassword.length >= 8);
const isPasswordMatching = computed(() => passwordForm.value.newPassword && passwordForm.value.confirmPassword && passwordForm.value.newPassword === passwordForm.value.confirmPassword);
const isPasswordFormValid = computed(() => {
    return passwordForm.value.currentPassword && isPasswordMinLength.value && isPasswordMatching.value;
});

// Submit Profile Changes
const saveProfile = () => {
    profileError.value = '';
    if (!profileForm.value.name.trim()) {
        profileError.value = 'Nama administrator tidak boleh kosong.';
        return;
    }
    if (!profileForm.value.email.trim() || !profileForm.value.email.includes('@')) {
        profileError.value = 'Format email administrator tidak valid.';
        return;
    }

    isSavingProfile.value = true;
    setTimeout(() => {
        updateAdminProfile({
            name: profileForm.value.name.trim(),
            email: profileForm.value.email.trim(),
        });
        isSavingProfile.value = false;
        triggerToast('Informasi profil administrator berhasil diperbarui!');
    }, 500);
};

// Submit Password Change
const savePassword = () => {
    passwordError.value = '';

    if (!passwordForm.value.currentPassword) {
        passwordError.value = 'Mohon masukkan kata sandi saat ini.';
        return;
    }
    if (!isPasswordMinLength.value) {
        passwordError.value = 'Kata sandi baru minimal 8 karakter.';
        return;
    }
    if (!isPasswordMatching.value) {
        passwordError.value = 'Konfirmasi kata sandi baru tidak sesuai.';
        return;
    }

    isSavingPassword.value = true;
    setTimeout(() => {
        isSavingPassword.value = false;
        passwordForm.value.currentPassword = '';
        passwordForm.value.newPassword = '';
        passwordForm.value.confirmPassword = '';
        triggerToast('Kata sandi administrator berhasil diperbarui!');
    }, 600);
};
</script>

<template>
    <Head title="Profil Admin" />

    <div class="p-6 sm:p-8 max-w-[1200px] mx-auto w-full space-y-6 font-sans">
        
        <!-- Toast Notification -->
        <div v-if="showToast" class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 transition-all animate-bounce-subtle">
            <div class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="text-sm font-medium">{{ toastMessage }}</span>
        </div>

        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Profil Administrator</h1>
                <p class="text-xs sm:text-sm text-slate-500 mt-1">
                    Kelola informasi profil akun Anda, ubah nama, email, dan perbarui kata sandi admin sistem.
                </p>
            </div>
            <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>Super Administrator</span>
            </span>
        </div>

        <!-- Admin Overview Identity Card -->
        <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md shrink-0">
                    {{ adminProfile.avatar || 'AP' }}
                </div>
                <div>
                    <h2 class="text-lg font-bold text-slate-900 leading-tight">{{ adminProfile.name }}</h2>
                    <p class="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>{{ adminProfile.email }}</span>
                        <span>•</span>
                        <span class="font-semibold text-blue-600">{{ adminProfile.role }}</span>
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-xs font-bold flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Akun Aktif
                </span>
            </div>
        </div>

        <!-- Grid 2 Columns: Edit Profile & Change Password -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <!-- SECTION 1: GANTI NAMA & EMAIL -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-base text-slate-900 leading-tight">Informasi Profil</h3>
                            <p class="text-[11px] text-slate-400">Ubah nama dan alamat email akun admin Anda.</p>
                        </div>
                    </div>

                    <!-- Error Alert -->
                    <div v-if="profileError" class="mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl font-medium">
                        {{ profileError }}
                    </div>

                    <form @submit.prevent="saveProfile" class="space-y-4">
                        <div>
                            <label for="admin_name" class="block text-xs font-bold text-slate-700 mb-1.5">
                                Nama Lengkap Administrator <span class="text-rose-500">*</span>
                            </label>
                            <input id="admin_name" v-model="profileForm.name" type="text" required
                                placeholder="Contoh: Admin Pabrik"
                                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800">
                        </div>

                        <div>
                            <label for="admin_email" class="block text-xs font-bold text-slate-700 mb-1.5">
                                Alamat Email Administrator <span class="text-rose-500">*</span>
                            </label>
                            <input id="admin_email" v-model="profileForm.email" type="email" required
                                placeholder="admin@eskristal.com"
                                class="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800">
                            <p class="text-[11px] text-slate-400 mt-1">Email ini digunakan untuk masuk ke portal admin dan menerima link pemulihan kata sandi.</p>
                        </div>

                        <div class="pt-3">
                            <button type="submit" :disabled="isSavingProfile"
                                class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50">
                                <svg v-if="isSavingProfile" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                <span>{{ isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- SECTION 2: GANTI PASSWORD ADMIN -->
            <div class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-2.5 pb-4 border-b border-slate-100 mb-5">
                        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-base text-slate-900 leading-tight">Perbarui Password</h3>
                            <p class="text-[11px] text-slate-400">Pastikan menggunakan kata sandi yang aman dan tidak mudah ditebak.</p>
                        </div>
                    </div>

                    <!-- Error Alert -->
                    <div v-if="passwordError" class="mb-4 p-3 bg-rose-50 text-rose-800 border border-rose-200 text-xs rounded-xl font-medium">
                        {{ passwordError }}
                    </div>

                    <form @submit.prevent="savePassword" class="space-y-4">
                        <!-- Password Saat Ini -->
                        <div>
                            <label for="admin_current_password" class="block text-xs font-bold text-slate-700 mb-1.5">
                                Kata Sandi Saat Ini <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <input id="admin_current_password" v-model="passwordForm.currentPassword" 
                                    :type="showCurrentPassword ? 'text' : 'password'" required
                                    placeholder="Masukkan kata sandi saat ini"
                                    class="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800">
                                <button type="button" @click="showCurrentPassword = !showCurrentPassword"
                                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <svg v-if="!showCurrentPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Password Baru -->
                        <div>
                            <label for="admin_new_password" class="block text-xs font-bold text-slate-700 mb-1.5">
                                Kata Sandi Baru <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <input id="admin_new_password" v-model="passwordForm.newPassword" 
                                    :type="showNewPassword ? 'text' : 'password'" required
                                    placeholder="Minimal 8 karakter baru"
                                    class="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800">
                                <button type="button" @click="showNewPassword = !showNewPassword"
                                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <svg v-if="!showNewPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Konfirmasi Password Baru -->
                        <div>
                            <label for="admin_confirm_password" class="block text-xs font-bold text-slate-700 mb-1.5">
                                Konfirmasi Kata Sandi Baru <span class="text-rose-500">*</span>
                            </label>
                            <div class="relative">
                                <input id="admin_confirm_password" v-model="passwordForm.confirmPassword" 
                                    :type="showConfirmPassword ? 'text' : 'password'" required
                                    placeholder="Ulangi kata sandi baru"
                                    class="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium text-slate-800">
                                <button type="button" @click="showConfirmPassword = !showConfirmPassword"
                                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer">
                                    <svg v-if="!showConfirmPassword" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.452 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path></svg>
                                </button>
                            </div>
                        </div>

                        <!-- Password Rule Checklist -->
                        <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5 text-[11px]">
                            <div class="flex items-center gap-2" :class="isPasswordMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-400'">
                                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="isPasswordMinLength ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01'"></path></svg>
                                <span>Minimal 8 karakter</span>
                            </div>
                            <div class="flex items-center gap-2" :class="isPasswordMatching ? 'text-emerald-700 font-semibold' : 'text-slate-400'">
                                <svg class="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" :d="isPasswordMatching ? 'M5 13l4 4L19 7' : 'M12 8v4m0 4h.01'"></path></svg>
                                <span>Konfirmasi kata sandi cocok</span>
                            </div>
                        </div>

                        <div class="pt-2">
                            <button type="submit" :disabled="!isPasswordFormValid || isSavingPassword"
                                class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                                <svg v-if="isSavingPassword" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                </svg>
                                <span>{{ isSavingPassword ? 'Menyimpan...' : 'Perbarui Password Admin' }}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>

    </div>
</template>
