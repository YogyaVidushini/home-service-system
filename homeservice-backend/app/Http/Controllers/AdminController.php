<?php
namespace App\Http\Controllers;

use App\Models\Worker;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class AdminController extends Controller
{
    // Get all pending workers
    public function pendingWorkers()
    {
        $workers = Worker::with('user')
            ->where('status', 'pending')
            ->latest()
            ->get();

        return response()->json($workers);
    }

    // Get all workers
    public function allWorkers()
    {
        $workers = Worker::with('user')->latest()->get();
        return response()->json($workers);
    }

    // Get all customers
    public function allCustomers()
    {
        $customers = User::where('role', 'customer')->latest()->get();
        return response()->json($customers);
    }

    // Approve worker
    public function approveWorker($id)
    {
        $worker = Worker::with('user')->findOrFail($id);
        $worker->update(['status' => 'approved']);

        // Create in-app notification
        Notification::create([
            'user_id' => $worker->user_id,
            'title'   => '🎉 Application Approved!',
            'message' => 'Congratulations ' . $worker->user->username 
                       . '! Your worker application has been approved. '
                       . 'You can now log in to your dashboard.',
        ]);

        // Send email notification
        Mail::raw(
            'Hi ' . $worker->user->username . ',\n\n'
            . 'Your HomeService worker application has been APPROVED!\n'
            . 'You can now log in at: http://localhost:5173/login\n\n'
            . 'Welcome to the team!\n— HomeService Admin',
            function ($message) use ($worker) {
                $message->to($worker->user->email)
                        ->subject('✅ HomeService — Application Approved!');
            }
        );

        return response()->json(['message' => 'Worker approved successfully']);
    }

    // Reject worker
    public function rejectWorker(Request $request, $id)
    {
        $request->validate(['reason' => 'required|string']);

        $worker = Worker::with('user')->findOrFail($id);
        $worker->update([
            'status'           => 'rejected',
            'rejection_reason' => $request->reason,
        ]);

        // Create in-app notification
        Notification::create([
            'user_id' => $worker->user_id,
            'title'   => '❌ Application Rejected',
            'message' => 'Your application was rejected. Reason: ' . $request->reason,
        ]);

        // Send email
        Mail::raw(
            'Hi ' . $worker->user->username . ',\n\n'
            . 'Unfortunately your application was rejected.\n'
            . 'Reason: ' . $request->reason . '\n\n'
            . '— HomeService Admin',
            function ($message) use ($worker) {
                $message->to($worker->user->email)
                        ->subject('HomeService — Application Update');
            }
        );

        return response()->json(['message' => 'Worker rejected']);
    }

    // Dashboard stats
    public function stats()
    {
        return response()->json([
            'total_workers'   => Worker::where('status', 'approved')->count(),
            'pending_workers' => Worker::where('status', 'pending')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
        ]);
    }
    public function workerDetail($id)
    {
    $worker = Worker::with('user')->findOrFail($id);

    // ✅ Use full URL with correct storage path
    $base = config('app.url') . '/storage/';

    $worker->nic_front_url     = $worker->nic_front
        ? $base . $worker->nic_front : null;
    $worker->nic_back_url      = $worker->nic_back
        ? $base . $worker->nic_back : null;
    $worker->police_report_url = $worker->police_report
        ? $base . $worker->police_report : null;
    $worker->other_docs_url    = $worker->other_docs
        ? $base . $worker->other_docs : null;

    return response()->json($worker);
    }
}