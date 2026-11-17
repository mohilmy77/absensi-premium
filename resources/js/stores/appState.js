import { ref, computed } from 'vue';

// Bersihkan key localStorage lama jika ada agar tidak memberatkan browser
if (typeof window !== 'undefined') {
    try {
        ['pek_employees_v1', 'pek_attendance_v1', 'pek_schedules_v1', 'pek_geofencing_v1', 'pek_payroll_adj_v1', 'pek_current_user_v1', 'ice_factory_app_state_v1'].forEach(k => {
            localStorage.removeItem(k);
        });
    } catch (e) {
        // Abaikan jika storage dinonaktifkan
    }
}

// Sample SVG selfie data generator untuk preview absensi karyawan
export const createSampleSelfie = (
    name, 
    time = '07:48', 
    isVerified = true, 
    type = 'Datang', 
    lat = 0.539716, 
    lng = 123.058278, 
    date = '09/11/2026'
) => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    
    // Format date jika ISO YYYY-MM-DD menjadi DD/MM/YYYY
    let formattedDate = date;
    if (date && date.includes('-')) {
        const parts = date.split('-');
        if (parts.length === 3) {
            formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
    }

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
        <defs>
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#1e3a8a" />
            </linearGradient>
            <linearGradient id="uniform" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#1d4ed8" />
                <stop offset="100%" stop-color="#2563eb" />
            </linearGradient>
        </defs>
        <rect width="480" height="360" fill="url(#bg)" />
        
        <!-- Factory background elements -->
        <rect x="30" y="30" width="80" height="190" fill="#334155" opacity="0.4" rx="4" />
        <rect x="370" y="40" width="80" height="180" fill="#334155" opacity="0.4" rx="4" />
        
        <!-- Person Body -->
        <path d="M 90 360 L 110 320 C 125 240, 165 210, 240 210 C 315 210, 355 240, 370 320 L 390 360 Z" fill="url(#uniform)" />
        <!-- Reflective safety vest stripes -->
        <rect x="180" y="225" width="20" height="135" fill="#22c55e" opacity="0.9" rx="2" />
        <rect x="280" y="225" width="20" height="135" fill="#22c55e" opacity="0.9" rx="2" />
        
        <!-- Face -->
        <ellipse cx="240" cy="145" rx="55" ry="66" fill="#fed7aa" />
        <!-- Safety Helmet (Blue) -->
        <path d="M 174 118 C 178 58, 302 58, 306 118 Z" fill="#0284c7" />
        <rect x="162" y="114" width="156" height="13" rx="4" fill="#0369a1" />
        <circle cx="240" cy="86" r="11" fill="#38bdf8" />
        
        <!-- Face oval recognition guide -->
        <ellipse cx="240" cy="150" rx="80" ry="100" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6 4" opacity="0.6" />
        
        <!-- Name Initials Badge -->
        <circle cx="240" cy="160" r="24" fill="#1e293b" opacity="0.85" />
        <text x="240" y="167" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="bold" fill="#ffffff" text-anchor="middle">${initials}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
};

// Pemetaan prefix ID berdasarkan divisi
export const DIVISION_PREFIXES = {
    'Produksi': 'PRD',
    'Driver': 'DRV',
    'Supervisor': 'SPV',
    'Kasir': 'KSR',
};

// Initial default employees (Urutan lama ke baru)
const DEFAULT_EMPLOYEES = [
    {
        id: 'PRD-001',
        name: 'Rahmat Malango',
        division: 'Produksi',
        phone: '081244556601',
        statusKerja: 'Lama > 1 tahun',
        wage: 60000,
        isActive: true,
        avatarBg: 'bg-emerald-100 text-emerald-700',
        initials: 'RM',
        points: 270,
    },
    {
        id: 'PRD-002',
        name: 'Zul Ismail',
        division: 'Produksi',
        phone: '081244556602',
        statusKerja: 'Baru',
        wage: 50000,
        isActive: true,
        avatarBg: 'bg-sky-100 text-sky-700',
        initials: 'ZI',
        points: 270,
    },
    {
        id: 'PRD-003',
        name: 'Zulfikar Umasugi',
        division: 'Produksi',
        phone: '081244556605',
        statusKerja: 'Lama > 1 tahun',
        wage: 65000,
        isActive: true,
        avatarBg: 'bg-teal-100 text-teal-700',
        initials: 'ZU',
        points: 240,
    },
    {
        id: 'KSR-001',
        name: 'Silfana Didipu',
        division: 'Kasir',
        phone: '081244556603',
        statusKerja: 'Baru',
        wage: 50000,
        isActive: true,
        avatarBg: 'bg-amber-100 text-amber-700',
        initials: 'SD',
        points: 260,
    },
    {
        id: 'SPV-001',
        name: 'Ambarak Ammarie',
        division: 'Supervisor',
        phone: '081244556604',
        statusKerja: 'Baru',
        wage: 50000,
        isActive: true,
        avatarBg: 'bg-purple-100 text-purple-700',
        initials: 'AA',
        points: 270,
    },
    {
        id: 'DRV-001',
        name: 'Ramdan Ahmad',
        division: 'Driver',
        phone: '081244556606',
        statusKerja: 'Lama > 1 tahun',
        wage: 60000,
        isActive: true,
        avatarBg: 'bg-blue-100 text-blue-700',
        initials: 'RA',
        points: 250,
    },
];

// Initial factory & geofence settings - Titik Asli Pabrik Premium Es Tube Kristal, Jl. Imam Bonjol, Gorontalo
const DEFAULT_GEOFENCING = {
    name: 'Premium Es Tube Kristal',
    address: 'Jl. Imam Bonjol, Kota Gorontalo',
    lat: 0.539716,
    lng: 123.058278,
    radius: 100,
    timezone: 'WITA (UTC+8)',
};

// Helper generate relative date string (YYYY-MM-DD)
const getRelativeDateStr = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() - offsetDays);
    return d.toISOString().split('T')[0];
};

const dateToday = getRelativeDateStr(0);
const dateYesterday = getRelativeDateStr(1);
const date2DaysAgo = getRelativeDateStr(2);
const date3DaysAgo = getRelativeDateStr(3);
const date5DaysAgo = getRelativeDateStr(5);
const date10DaysAgo = getRelativeDateStr(10);

// Initial default attendance records (Hari ini, Kemarin, dan Riwayat Lampau)
const DEFAULT_ATTENDANCE = [
    // --- HARI INI ---
    {
        id: `ATT-${dateToday.replace(/-/g, '')}-001`,
        employeeId: 'PRD-002',
        name: 'Zul Ismail',
        division: 'Produksi',
        shift: 'Shift 1',
        date: dateToday,
        timeIn: '07:50',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539718,
        lng: 123.058275,
        distanceMeters: 5,
        photo: createSampleSelfie('Zul Ismail', '07:50'),
        notes: 'Absen masuk tepat waktu di area pabrik',
    },
    {
        id: `ATT-${dateToday.replace(/-/g, '')}-002`,
        employeeId: 'KSR-001',
        name: 'Silfana Didipu',
        division: 'Kasir',
        shift: 'Shift 1',
        date: dateToday,
        timeIn: '08:12',
        timeOut: '-',
        status: 'Terlambat',
        points: '+20',
        lat: 0.539730,
        lng: 123.058290,
        distanceMeters: 21,
        photo: createSampleSelfie('Silfana Didipu', '08:12'),
        notes: 'Terlambat 12 menit karena hujan lebat',
    },
    {
        id: `ATT-${dateToday.replace(/-/g, '')}-003`,
        employeeId: 'SPV-001',
        name: 'Ambarak Ammarie',
        division: 'Supervisor',
        shift: 'Shift 1',
        date: dateToday,
        timeIn: '07:55',
        timeOut: '17:10',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539715,
        lng: 123.058280,
        distanceMeters: 4,
        photo: createSampleSelfie('Ambarak Ammarie', '07:55'),
        notes: 'Hadir tepat waktu dan buka operasional',
    },
    {
        id: `ATT-${dateToday.replace(/-/g, '')}-004`,
        employeeId: 'PRD-003',
        name: 'Zulfikar Umasugi',
        division: 'Produksi',
        shift: 'Shift 1',
        date: dateToday,
        timeIn: '-',
        timeOut: '-',
        status: 'Izin disetujui',
        points: '-',
        lat: null,
        lng: null,
        distanceMeters: null,
        photo: null,
        notes: 'Izin urusan keluarga mendesak disetujui Supervisor',
    },
    {
        id: `ATT-${dateToday.replace(/-/g, '')}-005`,
        employeeId: 'DRV-001',
        name: 'Ramdan Ahmad',
        division: 'Driver',
        shift: 'Shift 1',
        date: dateToday,
        timeIn: '08:24',
        timeOut: '-',
        status: 'Terlambat',
        points: '+10',
        lat: 0.539745,
        lng: 123.058310,
        distanceMeters: 36,
        photo: createSampleSelfie('Ramdan Ahmad', '08:24'),
        notes: 'Pengiriman es pagi terlambat datang',
    },

    // --- KEMARIN ---
    {
        id: `ATT-${dateYesterday.replace(/-/g, '')}-001`,
        employeeId: 'PRD-001',
        name: 'Rahmat Malango',
        division: 'Produksi',
        shift: 'Shift 1',
        date: dateYesterday,
        timeIn: '07:48',
        timeOut: '17:05',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539720,
        lng: 123.058282,
        distanceMeters: 8,
        photo: createSampleSelfie('Rahmat Malango', '07:48'),
        notes: 'Presensi shift 1 lengkap',
    },
    {
        id: `ATT-${dateYesterday.replace(/-/g, '')}-002`,
        employeeId: 'PRD-002',
        name: 'Zul Ismail',
        division: 'Produksi',
        shift: 'Shift 1',
        date: dateYesterday,
        timeIn: '07:55',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539718,
        lng: 123.058275,
        distanceMeters: 5,
        photo: createSampleSelfie('Zul Ismail', '07:55'),
        notes: 'Hadir tepat waktu',
    },
    {
        id: `ATT-${dateYesterday.replace(/-/g, '')}-003`,
        employeeId: 'KSR-001',
        name: 'Silfana Didipu',
        division: 'Kasir',
        shift: 'Shift 1',
        date: dateYesterday,
        timeIn: '07:50',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539722,
        lng: 123.058280,
        distanceMeters: 10,
        photo: createSampleSelfie('Silfana Didipu', '07:50'),
        notes: 'Hadir tepat waktu',
    },
    {
        id: `ATT-${dateYesterday.replace(/-/g, '')}-004`,
        employeeId: 'SPV-001',
        name: 'Ambarak Ammarie',
        division: 'Supervisor',
        shift: 'Shift 1',
        date: dateYesterday,
        timeIn: '07:45',
        timeOut: '17:15',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539715,
        lng: 123.058280,
        distanceMeters: 4,
        photo: createSampleSelfie('Ambarak Ammarie', '07:45'),
        notes: 'Hadir tepat waktu',
    },
    {
        id: `ATT-${dateYesterday.replace(/-/g, '')}-005`,
        employeeId: 'PRD-003',
        name: 'Zulfikar Umasugi',
        division: 'Produksi',
        shift: 'Shift 1',
        date: dateYesterday,
        timeIn: '08:08',
        timeOut: '17:00',
        status: 'Terlambat',
        points: '+20',
        lat: 0.539725,
        lng: 123.058285,
        distanceMeters: 12,
        photo: createSampleSelfie('Zulfikar Umasugi', '08:08'),
        notes: 'Terlambat 8 menit',
    },
    {
        id: `ATT-${dateYesterday.replace(/-/g, '')}-006`,
        employeeId: 'DRV-001',
        name: 'Ramdan Ahmad',
        division: 'Driver',
        shift: 'Shift 1',
        date: dateYesterday,
        timeIn: '07:40',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539716,
        lng: 123.058278,
        distanceMeters: 3,
        photo: createSampleSelfie('Ramdan Ahmad', '07:40'),
        notes: 'Pengiriman tepat waktu',
    },

    // --- 2 HARI LALU ---
    {
        id: `ATT-${date2DaysAgo.replace(/-/g, '')}-001`,
        employeeId: 'PRD-001',
        name: 'Rahmat Malango',
        division: 'Produksi',
        shift: 'Shift 1',
        date: date2DaysAgo,
        timeIn: '07:42',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539720,
        lng: 123.058282,
        distanceMeters: 7,
        photo: createSampleSelfie('Rahmat Malango', '07:42'),
        notes: 'Lembur shift sore 30 menit',
    },
    {
        id: `ATT-${date2DaysAgo.replace(/-/g, '')}-002`,
        employeeId: 'PRD-002',
        name: 'Zul Ismail',
        division: 'Produksi',
        shift: 'Shift 1',
        date: date2DaysAgo,
        timeIn: '07:50',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539718,
        lng: 123.058275,
        distanceMeters: 5,
        photo: createSampleSelfie('Zul Ismail', '07:50'),
        notes: 'Hadir tepat waktu',
    },
    {
        id: `ATT-${date2DaysAgo.replace(/-/g, '')}-003`,
        employeeId: 'DRV-001',
        name: 'Ramdan Ahmad',
        division: 'Driver',
        shift: 'Shift 1',
        date: date2DaysAgo,
        timeIn: '07:35',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539716,
        lng: 123.058278,
        distanceMeters: 3,
        photo: createSampleSelfie('Ramdan Ahmad', '07:35'),
        notes: 'Distribusi es rute barat lancar',
    },

    // --- 3 HARI LALU ---
    {
        id: `ATT-${date3DaysAgo.replace(/-/g, '')}-001`,
        employeeId: 'PRD-001',
        name: 'Rahmat Malango',
        division: 'Produksi',
        shift: 'Shift 1',
        date: date3DaysAgo,
        timeIn: '08:15',
        timeOut: '17:00',
        status: 'Terlambat',
        points: '+20',
        lat: 0.539725,
        lng: 123.058285,
        distanceMeters: 14,
        photo: createSampleSelfie('Rahmat Malango', '08:15'),
        notes: 'Terlambat 15 menit kendala ban motor',
    },
    {
        id: `ATT-${date3DaysAgo.replace(/-/g, '')}-002`,
        employeeId: 'PRD-003',
        name: 'Zulfikar Umasugi',
        division: 'Produksi',
        shift: 'Shift 1',
        date: date3DaysAgo,
        timeIn: '-',
        timeOut: '-',
        status: 'Sakit',
        points: '-',
        lat: null,
        lng: null,
        distanceMeters: null,
        photo: null,
        notes: 'Surat dokter terlampir demam',
    },

    // --- 5 HARI LALU ---
    {
        id: `ATT-${date5DaysAgo.replace(/-/g, '')}-001`,
        employeeId: 'KSR-001',
        name: 'Silfana Didipu',
        division: 'Kasir',
        shift: 'Shift 1',
        date: date5DaysAgo,
        timeIn: '07:48',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539720,
        lng: 123.058280,
        distanceMeters: 8,
        photo: createSampleSelfie('Silfana Didipu', '07:48'),
        notes: 'Hadir tepat waktu',
    },

    // --- 10 HARI LALU ---
    {
        id: `ATT-${date10DaysAgo.replace(/-/g, '')}-001`,
        employeeId: 'SPV-001',
        name: 'Ambarak Ammarie',
        division: 'Supervisor',
        shift: 'Shift 1',
        date: date10DaysAgo,
        timeIn: '07:50',
        timeOut: '17:05',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539715,
        lng: 123.058280,
        distanceMeters: 4,
        photo: createSampleSelfie('Ambarak Ammarie', '07:50'),
        notes: 'Audit mingguan pabrik',
    },
];

// Initial schedules
const DEFAULT_SCHEDULES = {
    'PRD-001': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur', 'Shift 1'],
    'PRD-002': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur'],
    'PRD-003': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur'],
    'KSR-001': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1'],
    'SPV-001': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur', 'Shift 1'],
    'DRV-001': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur'],
};

// --- REACTIVE STATE SINGLETON (Pure in-memory, resets on refresh) ---
export const employees = ref(JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES)));
export const attendanceRecords = ref(
    JSON.parse(JSON.stringify(DEFAULT_ATTENDANCE)).map(att => {
        const lat = att.lat || 0.539716;
        const lng = att.lng || 123.058278;
        if (!att.photo && !att.status.toLowerCase().includes('izin') && !att.status.toLowerCase().includes('sakit') && !att.status.toLowerCase().includes('alpa')) {
            att.photo = createSampleSelfie(att.name, att.timeIn || '07:50', true, 'Datang', lat, lng, att.date);
        }
        if (att.timeOut && att.timeOut !== '-' && !att.photoOut) {
            att.photoOut = createSampleSelfie(att.name, att.timeOut, true, 'Pulang', lat, lng, att.date);
        }
        return att;
    })
);
export const factorySettings = ref({ ...DEFAULT_GEOFENCING });
export const schedules = ref(JSON.parse(JSON.stringify(DEFAULT_SCHEDULES)));
export const payrollAdjustments = ref({});

// Active current employee for employee portal (default Rahmat Malango: PRD-001)
export const currentEmployeeId = ref('PRD-001');

// Helper generator ID berikutnya berdasarkan divisi
export const generateNextEmployeeId = (division = 'Produksi') => {
    const prefix = DIVISION_PREFIXES[division] || 'PRD';
    const matching = employees.value.filter(e => e.id && e.id.startsWith(prefix + '-'));
    let maxNum = 0;
    matching.forEach(e => {
        const parts = e.id.split('-');
        if (parts.length === 2) {
            const num = parseInt(parts[1], 10);
            if (!isNaN(num) && num > maxNum) {
                maxNum = num;
            }
        }
    });
    return `${prefix}-${String(maxNum + 1).padStart(3, '0')}`;
};

// Helper cek apakah karyawan aktif
export const isEmployeeActive = (id) => {
    const emp = employees.value.find(e => e.id === id);
    return emp ? emp.isActive : false;
};

// --- EMPLOYEE CRUD METHODS ---
export const addEmployee = (data) => {
    const division = data.division || 'Produksi';
    const newId = data.id || generateNextEmployeeId(division);
    const initials = data.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    
    const colors = [
        'bg-emerald-100 text-emerald-700',
        'bg-sky-100 text-sky-700',
        'bg-amber-100 text-amber-700',
        'bg-purple-100 text-purple-700',
        'bg-teal-100 text-teal-700',
        'bg-blue-100 text-blue-700',
        'bg-indigo-100 text-indigo-700',
    ];
    const avatarBg = colors[employees.value.length % colors.length];

    const newEmp = {
        id: newId,
        name: data.name,
        division,
        phone: data.phone || '081234567890',
        statusKerja: data.statusKerja || 'Baru',
        wage: Number(data.wage) || 50000,
        isActive: true,
        avatarBg,
        initials,
        points: 250,
    };

    // Urutan lama ke baru: yang baru paling bawah / akhir
    employees.value.push(newEmp);

    // Init schedule for new employee
    if (!schedules.value[newId]) {
        schedules.value[newId] = ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur', 'Shift 1'];
    }

    return newEmp;
};

export const updateEmployee = (id, data) => {
    const idx = employees.value.findIndex(e => e.id === id);
    if (idx !== -1) {
        employees.value[idx] = {
            ...employees.value[idx],
            ...data,
            wage: Number(data.wage) || employees.value[idx].wage,
        };
        return employees.value[idx];
    }
    return null;
};

export const deleteEmployee = (id) => {
    employees.value = employees.value.filter(e => e.id !== id);
};

export const toggleEmployeeStatus = (id) => {
    const emp = employees.value.find(e => e.id === id);
    if (emp) {
        emp.isActive = !emp.isActive;
    }
};

// --- ATTENDANCE CRUD & ACTIONS ---
export const addAttendanceRecord = (record) => {
    const lat = record.lat || 0.539716;
    const lng = record.lng || 123.058278;
    const date = record.date || new Date().toISOString().split('T')[0];

    const newRecord = {
        id: record.id || `ATT-${Date.now()}`,
        employeeId: record.employeeId,
        name: record.name,
        division: record.division,
        shift: record.shift || 'Shift 1',
        date,
        timeIn: record.timeIn || '-',
        timeOut: record.timeOut || '-',
        status: record.status || 'Tepat waktu',
        points: record.points || '+30',
        lat: record.lat || null,
        lng: record.lng || null,
        distanceMeters: record.distanceMeters !== undefined ? record.distanceMeters : null,
        photo: record.photo || (record.status.toLowerCase().includes('izin') || record.status.toLowerCase().includes('sakit') || record.status.toLowerCase().includes('alpa') ? null : createSampleSelfie(record.name, record.timeIn || '07:50', true, 'Datang', lat, lng, date)),
        photoOut: record.photoOut || (record.timeOut && record.timeOut !== '-' ? createSampleSelfie(record.name, record.timeOut, true, 'Pulang', lat, lng, date) : null),
        notes: record.notes || '',
        attachment: record.attachment || null,
    };

    attendanceRecords.value.unshift(newRecord);

    // Update employee points if positive points awarded
    if (record.points && record.points.startsWith('+')) {
        const pts = parseInt(record.points.replace('+', ''), 10);
        const emp = employees.value.find(e => e.id === record.employeeId || e.name === record.name);
        if (emp && !isNaN(pts)) {
            emp.points = (emp.points || 250) + pts;
        }
    }

    return newRecord;
};

export const updateAttendanceRecord = (id, data) => {
    const idx = attendanceRecords.value.findIndex(a => a.id === id);
    if (idx !== -1) {
        attendanceRecords.value[idx] = {
            ...attendanceRecords.value[idx],
            ...data,
        };
        return attendanceRecords.value[idx];
    }
    return null;
};

export const deleteAttendanceRecord = (id) => {
    attendanceRecords.value = attendanceRecords.value.filter(a => a.id !== id);
};

// Clock-in action from Employee Attendance page with REAL photo and coordinates
export const submitEmployeeAttendance = ({ employeeId, timeIn, photo, lat, lng, distanceMeters }) => {
    const emp = employees.value.find(e => e.id === employeeId) || employees.value[0];
    const today = new Date().toISOString().split('T')[0];

    // Cek jika karyawan dinonaktifkan
    if (!emp.isActive) {
        throw new Error('Akun Anda dinonaktifkan oleh administrator.');
    }

    // Determine on-time or late status (Shift 1 starts at 08.00)
    let status = 'Tepat waktu';
    let points = '+30';

    if (timeIn) {
        const [h, m] = timeIn.split(/[:.]/).map(Number);
        if (h > 8 || (h === 8 && m > 15)) {
            status = 'Terlambat';
            points = '+10';
        } else if (h === 8 && m > 0) {
            status = 'Terlambat';
            points = '+20';
        }
    }

    // Check if employee already has attendance record for today
    const existingIndex = attendanceRecords.value.findIndex(
        a => a.employeeId === emp.id && a.date === today
    );

    if (existingIndex !== -1) {
        // Update existing today's record
        attendanceRecords.value[existingIndex] = {
            ...attendanceRecords.value[existingIndex],
            timeIn,
            status,
            points,
            photo: photo || attendanceRecords.value[existingIndex].photo,
            lat,
            lng,
            distanceMeters,
        };
        return attendanceRecords.value[existingIndex];
    } else {
        // Create new
        const record = addAttendanceRecord({
            employeeId: emp.id,
            name: emp.name,
            division: emp.division,
            shift: 'Shift 1',
            date: today,
            timeIn,
            timeOut: '-',
            status,
            points,
            lat,
            lng,
            distanceMeters,
            photo,
            notes: `Absen masuk foto mandiri (${distanceMeters}m dari pusat pabrik Jl. Imam Bonjol)`,
        });
        return record;
    }
};

// Clock-out action
export const submitEmployeeClockOut = ({ employeeId, timeOut, photoOut, lat, lng, distanceMeters }) => {
    const emp = employees.value.find(e => e.id === employeeId) || employees.value[0];
    const today = new Date().toISOString().split('T')[0];
    const usedLat = lat || factorySettings.value.lat;
    const usedLng = lng || factorySettings.value.lng;

    // Cek jika karyawan dinonaktifkan
    if (!emp.isActive) {
        throw new Error('Akun Anda dinonaktifkan oleh administrator.');
    }

    const record = attendanceRecords.value.find(
        a => a.employeeId === emp.id && a.date === today
    );

    const generatedPhotoOut = photoOut || createSampleSelfie(emp.name, timeOut, true, 'Pulang', usedLat, usedLng, today);

    if (record) {
        record.timeOut = timeOut;
        record.photoOut = generatedPhotoOut;
        if (lat) record.lat = lat;
        if (lng) record.lng = lng;
        if (distanceMeters !== undefined) record.distanceMeters = distanceMeters;
        return record;
    } else {
        return addAttendanceRecord({
            employeeId: emp.id,
            name: emp.name,
            division: emp.division,
            shift: 'Shift 1',
            date: today,
            timeIn: '08:00',
            timeOut,
            status: 'Tepat waktu',
            points: '+30',
            photoOut: generatedPhotoOut,
            lat: usedLat,
            lng: usedLng,
            distanceMeters,
            notes: 'Absen pulang mandiri via aplikasi',
        });
    }
};

// --- GEOFENCING CONFIGURATION ---
export const saveFactoryGeofence = (newSettings) => {
    factorySettings.value = {
        ...factorySettings.value,
        ...newSettings,
        radius: Number(newSettings.radius) || 100,
        lat: Number(newSettings.lat) || 0.539716,
        lng: Number(newSettings.lng) || 123.058278,
    };
};

// --- SCHEDULE CRUD ---
export const setEmployeeSchedule = (employeeId, dayIndex, shift) => {
    if (!schedules.value[employeeId]) {
        schedules.value[employeeId] = ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur'];
    }
    schedules.value[employeeId][dayIndex] = shift;
};

export const saveAllSchedules = (newSchedulesMap) => {
    schedules.value = { ...newSchedulesMap };
};

// --- PAYROLL ADJUSTMENTS CRUD ---
export const addPayrollAdjustment = (employeeId, adjustment) => {
    if (!payrollAdjustments.value[employeeId]) {
        payrollAdjustments.value[employeeId] = [];
    }
    const newAdj = {
        id: `ADJ-${Date.now()}`,
        type: adjustment.type || 'bonus',
        title: adjustment.title || 'Penyesuaian Manual',
        amount: Number(adjustment.amount) || 0,
        date: adjustment.date || new Date().toISOString().split('T')[0],
    };
    payrollAdjustments.value[employeeId].push(newAdj);
    return newAdj;
};

export const deletePayrollAdjustment = (employeeId, adjId) => {
    if (payrollAdjustments.value[employeeId]) {
        payrollAdjustments.value[employeeId] = payrollAdjustments.value[employeeId].filter(a => a.id !== adjId);
    }
};

// --- COMPUTED HELPERS ---
export const activeEmployees = computed(() => employees.value.filter(e => e.isActive));

export const currentEmployee = computed(() => {
    return employees.value.find(e => e.id === currentEmployeeId.value) || employees.value[0];
});

export const todayEmployeeAttendance = computed(() => {
    const empId = currentEmployeeId.value;
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.value.find(
        a => a.employeeId === empId && a.date === today
    );
});

// --- ADMIN PROFILE STATE ---
export const adminProfile = ref({
    name: 'Admin Pabrik',
    email: 'admin@eskristal.com',
    role: 'Super Administrator',
    avatar: 'AP',
});

export const updateAdminProfile = ({ name, email }) => {
    if (name) {
        adminProfile.value.name = name;
        adminProfile.value.avatar = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    }
    if (email) {
        adminProfile.value.email = email;
    }
    return adminProfile.value;
};

// Calculate Haversine Distance in meters
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
};
