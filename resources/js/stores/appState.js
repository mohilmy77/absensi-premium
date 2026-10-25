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
export const createSampleSelfie = (name, time = '07:48', isVerified = true) => {
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('');
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
        <rect x="30" y="40" width="80" height="220" fill="#334155" opacity="0.4" rx="4" />
        <rect x="370" y="50" width="80" height="210" fill="#334155" opacity="0.4" rx="4" />
        
        <!-- Person Body -->
        <path d="M 120 360 C 130 250, 170 230, 240 230 C 310 230, 350 250, 360 360 Z" fill="url(#uniform)" />
        <!-- Reflective safety vest stripes -->
        <rect x="175" y="245" width="22" height="115" fill="#22c55e" opacity="0.9" rx="2" />
        <rect x="283" y="245" width="22" height="115" fill="#22c55e" opacity="0.9" rx="2" />
        
        <!-- Face -->
        <ellipse cx="240" cy="165" rx="60" ry="72" fill="#fed7aa" />
        <!-- Safety Helmet (Blue) -->
        <path d="M 168 135 C 172 70, 308 70, 312 135 Z" fill="#0284c7" />
        <rect x="156" y="130" width="168" height="14" rx="5" fill="#0369a1" />
        <circle cx="240" cy="100" r="12" fill="#38bdf8" />
        
        <!-- Face oval recognition guide -->
        <ellipse cx="240" cy="170" rx="90" ry="115" fill="none" stroke="#38bdf8" stroke-width="2" stroke-dasharray="8 6" opacity="0.75" />
        
        <!-- Name Initials Badge -->
        <circle cx="240" cy="180" r="28" fill="#1e293b" opacity="0.8" />
        <text x="240" y="188" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">${initials}</text>

        <!-- Bottom verification banner -->
        <rect x="0" y="315" width="480" height="45" fill="rgba(15, 23, 42, 0.9)" />
        <circle cx="24" cy="337" r="6" fill="${isVerified ? '#10b981' : '#f59e0b'}" />
        <text x="38" y="341" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">${name}</text>
        <text x="260" y="341" font-family="monospace" font-size="12" font-weight="bold" fill="#38bdf8">${time} WITA • GPS VERIFIED</text>
        <rect x="400" y="325" width="65" height="24" rx="4" fill="${isVerified ? '#10b981' : '#f59e0b'}" />
        <text x="432" y="341" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">VALID</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg.trim());
};

// Initial default employees
const DEFAULT_EMPLOYEES = [
    {
        id: 'PEK-001',
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
        id: 'PEK-002',
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
        id: 'PEK-003',
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
        id: 'PEK-004',
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
        id: 'PEK-005',
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
        id: 'PEK-006',
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

// Initial default attendance records
const DEFAULT_ATTENDANCE = [
    {
        id: 'ATT-20261009-001',
        employeeId: 'PEK-001',
        name: 'Rahmat Malango',
        division: 'Produksi',
        shift: 'Shift 1',
        date: '2026-10-09',
        timeIn: '07:48',
        timeOut: '17:05',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539720,
        lng: 123.058282,
        distanceMeters: 8,
        photo: createSampleSelfie('Rahmat Malango', '07:48'),
        notes: 'Hadir shift 1 di pabrik Jl. Imam Bonjol',
    },
    {
        id: 'ATT-20261009-002',
        employeeId: 'PEK-002',
        name: 'Zul Ismail',
        division: 'Produksi',
        shift: 'Shift 1',
        date: '2026-10-09',
        timeIn: '07:52',
        timeOut: '17:00',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539718,
        lng: 123.058275,
        distanceMeters: 5,
        photo: createSampleSelfie('Zul Ismail', '07:52'),
        notes: 'Absen masuk tepat waktu di area pabrik',
    },
    {
        id: 'ATT-20261009-003',
        employeeId: 'PEK-003',
        name: 'Silfana Didipu',
        division: 'Kasir',
        shift: 'Shift 1',
        date: '2026-10-09',
        timeIn: '08:12',
        timeOut: '-',
        status: 'Terlambat',
        points: '+20',
        lat: 0.539730,
        lng: 123.058290,
        distanceMeters: 21,
        photo: createSampleSelfie('Silfana Didipu', '08:12'),
        notes: 'Terlambat 12 menit karena hujan',
    },
    {
        id: 'ATT-20261009-004',
        employeeId: 'PEK-004',
        name: 'Ambarak Ammarie',
        division: 'Supervisor',
        shift: 'Shift 1',
        date: '2026-10-09',
        timeIn: '07:55',
        timeOut: '17:10',
        status: 'Tepat waktu',
        points: '+30',
        lat: 0.539715,
        lng: 123.058280,
        distanceMeters: 4,
        photo: createSampleSelfie('Ambarak Ammarie', '07:55'),
        notes: 'Hadir tepat waktu',
    },
    {
        id: 'ATT-20261009-005',
        employeeId: 'PEK-005',
        name: 'Zulfikar Umasugi',
        division: 'Produksi',
        shift: 'Shift 1',
        date: '2026-10-09',
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
        id: 'ATT-20261009-006',
        employeeId: 'PEK-006',
        name: 'Ramdan Ahmad',
        division: 'Driver',
        shift: 'Shift 1',
        date: '2026-10-09',
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
];

// Initial schedules
const DEFAULT_SCHEDULES = {
    'PEK-001': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur', 'Shift 1'],
    'PEK-002': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur'],
    'PEK-003': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1'],
    'PEK-004': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur', 'Shift 1'],
    'PEK-005': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur'],
    'PEK-006': ['Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Shift 1', 'Libur'],
};

// --- REACTIVE STATE SINGLETON (Pure in-memory, resets on refresh) ---
export const employees = ref(JSON.parse(JSON.stringify(DEFAULT_EMPLOYEES)));
export const attendanceRecords = ref(JSON.parse(JSON.stringify(DEFAULT_ATTENDANCE)));
export const factorySettings = ref({ ...DEFAULT_GEOFENCING });
export const schedules = ref(JSON.parse(JSON.stringify(DEFAULT_SCHEDULES)));
export const payrollAdjustments = ref({});

// Active current employee for employee portal (default Rahmat Malango)
export const currentEmployeeId = ref('PEK-001');

// --- EMPLOYEE CRUD METHODS ---
export const addEmployee = (data) => {
    const nextNum = employees.value.length + 1;
    const newId = data.id || `PEK-${String(nextNum).padStart(3, '0')}`;
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
    const avatarBg = colors[nextNum % colors.length];

    const newEmp = {
        id: newId,
        name: data.name,
        division: data.division || 'Produksi',
        phone: data.phone || '081234567890',
        statusKerja: data.statusKerja || 'Baru',
        wage: Number(data.wage) || 50000,
        isActive: true,
        avatarBg,
        initials,
        points: 250,
    };

    employees.value.unshift(newEmp);

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
    const newRecord = {
        id: record.id || `ATT-${Date.now()}`,
        employeeId: record.employeeId,
        name: record.name,
        division: record.division,
        shift: record.shift || 'Shift 1',
        date: record.date || new Date().toISOString().split('T')[0],
        timeIn: record.timeIn || '-',
        timeOut: record.timeOut || '-',
        status: record.status || 'Tepat waktu',
        points: record.points || '+30',
        lat: record.lat || null,
        lng: record.lng || null,
        distanceMeters: record.distanceMeters !== undefined ? record.distanceMeters : null,
        photo: record.photo || (record.status.toLowerCase().includes('izin') || record.status.toLowerCase().includes('sakit') ? null : createSampleSelfie(record.name, record.timeIn)),
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
export const submitEmployeeClockOut = ({ employeeId, timeOut }) => {
    const emp = employees.value.find(e => e.id === employeeId) || employees.value[0];
    const today = new Date().toISOString().split('T')[0];

    const record = attendanceRecords.value.find(
        a => a.employeeId === emp.id && a.date === today
    );

    if (record) {
        record.timeOut = timeOut;
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
