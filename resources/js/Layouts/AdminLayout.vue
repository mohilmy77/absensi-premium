<script setup>
import { Link, usePage } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';

const props = defineProps({
    title: String,
});

const page = usePage();
const mobileMenuOpen = ref(false);
const mainContentRef = ref(null);

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Rekap absensi', href: '/admin/manual-attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Data karyawan', href: '/admin/employees', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', badge: '6' },
    { name: 'Jadwal shift', href: '/admin/schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Daftar gaji & reward', href: '/admin/payroll', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const preferences = [
    { name: 'Pengaturan pabrik', href: '/admin/geofencing', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
];

const currentTitle = computed(() => {
    if (props.title) return props.title;
    if (page.props.title) return page.props.title;
    const all = [...navigation, ...preferences];
    const match = all.find(item => item.href === page.url || (item.href !== '/admin' && page.url.startsWith(item.href)));
    return match ? match.name : 'Dashboard';
});

// Auto scroll to top when page changes
watch(() => page.url, () => {
    if (mainContentRef.value) {
        mainContentRef.value.scrollTo({ top: 0, behavior: 'instant' });
    }
    mobileMenuOpen.value = false;
});

const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
</script>

<template>
    <div class="h-screen w-screen bg-slate-50 text-slate-700 font-sans flex overflow-hidden">
        
        <!-- Mobile Sidebar Backdrop -->
        <div v-if="mobileMenuOpen" @click="mobileMenuOpen = false" class="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden"></div>

        <!-- Sidebar (Desktop & Mobile Drawer) -->
        <aside class="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen z-50 transition-transform duration-200 ease-in-out md:translate-x-0 fixed md:static"
            :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'">
            
            <!-- Brand Header (Fixed at top) -->
            <div class="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
                <Link href="/admin" prefetch class="flex items-center gap-3 group">
                    <img src="/images/logo-premium.png" alt="Logo Premium Kristal" class="w-10 h-10 object-contain shrink-0 transition-transform group-hover:scale-105" />
                    <div>
                        <h1 class="text-sm font-bold text-slate-900 leading-tight">Premium<br>Es Kristal</h1>
                        <p class="text-[9px] text-slate-500 font-semibold tracking-wider">ABSENSI KARYAWAN</p>
                    </div>
                </Link>

                <!-- Close button on mobile -->
                <button @click="mobileMenuOpen = false" class="md:hidden text-slate-400 hover:text-slate-600 p-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <!-- Navigation Links (Scrollable area) -->
            <div class="flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-4">
                <div>
                    <p class="px-2 text-[10px] font-bold text-slate-400 mb-1.5 tracking-wider">MENU UTAMA</p>
                    <nav class="space-y-0.5">
                        <Link v-for="item in navigation" :key="item.name" :href="item.href" prefetch
                            class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                            :class="item.href === $page.url || ($page.url.startsWith('/admin') && item.href === '/admin' && $page.url === '/admin') ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
                            <div class="flex items-center min-w-0">
                                <svg class="w-4 h-4 mr-2.5 shrink-0" :class="item.href === $page.url ? 'text-blue-600' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
                                </svg>
                                <span class="truncate">{{ item.name }}</span>
                            </div>
                            <span v-if="item.badge" class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-bold ml-1 shrink-0">{{ item.badge }}</span>
                        </Link>
                    </nav>
                </div>

                <div>
                    <p class="px-2 text-[10px] font-bold text-slate-400 mb-1.5 tracking-wider">PREFERENSI</p>
                    <nav class="space-y-0.5">
                        <Link v-for="item in preferences" :key="item.name" :href="item.href" prefetch
                            class="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
                            :class="item.href === $page.url ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'">
                            <div class="flex items-center min-w-0">
                                <svg class="w-4 h-4 mr-2.5 shrink-0" :class="item.href === $page.url ? 'text-blue-600' : 'text-slate-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
                                </svg>
                                <span class="truncate">{{ item.name }}</span>
                            </div>
                        </Link>
                    </nav>
                </div>
            </div>

            <!-- Sidebar Footer (Docked at bottom, always visible without zoom-out) -->
            <div class="shrink-0 p-3 border-t border-slate-100 bg-white space-y-2">
                <a href="#" class="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50 transition-colors">
                    <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span>Pusat bantuan</span>
                </a>
                
                <div class="px-2.5 py-1.5 border border-slate-200/80 rounded-lg flex items-center gap-2 bg-slate-50/70 text-xs">
                    <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0"></span>
                    <span class="text-[11px] font-medium text-slate-600">Operasional 24 jam</span>
                    <span class="text-[10px] text-slate-400 font-semibold ml-auto">WITA</span>
                </div>

                <!-- Admin Profile Card -->
                <div class="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        AP
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs font-bold text-slate-900 truncate">Admin Pabrik</p>
                        <p class="text-[10px] text-slate-400 truncate">Administrator</p>
                    </div>
                    <Link href="/logout" method="post" as="button" class="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors" title="Keluar">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </Link>
                </div>
            </div>

        </aside>
        
        <!-- Main Content Area -->
        <main ref="mainContentRef" class="flex-1 flex flex-col h-screen overflow-y-auto min-w-0 bg-slate-50">
            
            <!-- Topbar (Compact 64px) -->
            <header class="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30">
                <div class="flex items-center gap-3">
                    <!-- Hamburger button on mobile -->
                    <button @click="mobileMenuOpen = true" class="md:hidden p-1.5 -ml-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-50">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>

                    <div class="text-xs sm:text-sm text-slate-500 font-medium truncate">
                        Workspace <span class="mx-1.5 text-slate-300">/</span> <span class="text-slate-900 font-semibold">{{ currentTitle }}</span>
                    </div>
                </div>

                <div class="flex items-center gap-3 sm:gap-4 shrink-0">
                    <span class="hidden sm:inline-block px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md">Data contoh</span>
                    <div class="hidden md:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        {{ currentDate }}
                    </div>
                    <button class="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 relative rounded-lg hover:bg-slate-50">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    </button>
                    <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">AP</div>
                </div>
            </header>

            <!-- Page Content Slot with Smooth Transition -->
            <div class="flex-1 w-full bg-slate-50">
                <Transition name="page-slide" mode="out-in" appear>
                    <div :key="$page.url" class="w-full">
                        <slot></slot>
                    </div>
                </Transition>
            </div>
            
            <!-- Global Footer -->
            <footer class="px-8 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between text-[11px] text-slate-400 shrink-0">
                <div>&copy; 2026 Premium Es Kristal. Semua hak dilindungi.</div>
                <div>Kota Gorontalo, Gorontalo - WITA</div>
            </footer>
        </main>
    </div>
</template>
