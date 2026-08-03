<?php
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\WorkerController;
use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;

Route::post('/register/customer', [AuthController::class, 'registerCustomer']);
Route::post('/register/worker', [AuthController::class, 'registerWorker']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [ContactController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // Customer routes
    Route::middleware('role:customer')->prefix('customer')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings', [BookingController::class, 'customerBookings']);
        Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);
        Route::post('/bookings/{id}/rate', [BookingController::class, 'rate']);
        Route::post('/emergency', [BookingController::class, 'emergency']);
    });

    // Worker routes
    Route::middleware('role:worker')->prefix('worker')->group(function () {
        Route::get('/profile', [WorkerController::class, 'profile']);
        Route::get('/notifications', [WorkerController::class, 'notifications']);
        Route::post('/notifications/{id}/read', [WorkerController::class, 'markRead']);
        Route::get('/bookings/available', [BookingController::class, 'availableBookings']);
        Route::get('/bookings/mine', [BookingController::class, 'workerBookings']);
        Route::post('/bookings/{id}/accept', [BookingController::class, 'accept']);
        Route::post('/bookings/{id}/in-progress', [BookingController::class, 'inProgress']);
        Route::post('/bookings/{id}/complete', [BookingController::class, 'complete']);
    });

    // Shared — worker public profile (customers need this)
    Route::get('/workers/{userId}/profile', [WorkerController::class, 'publicProfile']);

    // Admin routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/workers/pending', [AdminController::class, 'pendingWorkers']);
        Route::get('/workers', [AdminController::class, 'allWorkers']);
        Route::get('/workers/{id}', [AdminController::class, 'workerDetail']);
        Route::get('/customers', [AdminController::class, 'allCustomers']);
        Route::post('/workers/{id}/approve', [AdminController::class, 'approveWorker']);
        Route::post('/workers/{id}/reject', [AdminController::class, 'rejectWorker']);
        Route::get('/bookings', [BookingController::class, 'allBookings']);
        Route::get('/emergencies', [BookingController::class, 'allEmergencies']);
        Route::post('/emergencies/{id}/resolve', [BookingController::class, 'resolveEmergency']);
    });

});