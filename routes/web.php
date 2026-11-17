<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/employee', function () {
    return Inertia::render('Employee/Dashboard');
})->name('employee.dashboard');

Route::get('/employee/attendance', function () {
    return Inertia::render('Employee/Attendance');
})->name('employee.attendance');

Route::get('/employee/history', function () {
    return Inertia::render('Employee/History');
})->name('employee.history');

Route::get('/employee/schedule', function () {
    return Inertia::render('Employee/Schedule');
})->name('employee.schedule');

Route::get('/employee/payroll', function () {
    return Inertia::render('Employee/Payroll');
})->name('employee.payroll');

Route::get('/employee/password', function () {
    return Inertia::render('Employee/Password');
})->name('employee.password');

Route::get('/admin', function () {
    return Inertia::render('Admin/Dashboard');
})->name('admin.dashboard');

Route::get('/admin/employees', function () {
    return Inertia::render('Admin/Employees');
})->name('admin.employees');

Route::get('/admin/schedule', function () {
    return Inertia::render('Admin/Schedule');
})->name('admin.schedule');

Route::get('/admin/geofencing', function () {
    return Inertia::render('Admin/Geofencing');
})->name('admin.geofencing');

Route::get('/admin/manual-attendance', function () {
    return Inertia::render('Admin/ManualAttendance');
})->name('admin.manual');

Route::get('/admin/payroll', function () {
    return Inertia::render('Admin/Payroll');
})->name('admin.payroll');

Route::get('/admin/profile', function () {
    return Inertia::render('Admin/Profile');
})->name('admin.profile');



require __DIR__.'/auth.php';
