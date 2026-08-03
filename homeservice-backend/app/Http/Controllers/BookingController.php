<?php
namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Worker;
use App\Models\Rating;
use App\Models\Emergency;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    // Customer creates a booking
    public function store(Request $request)
    {
        $request->validate([
            'service_type'   => 'required|string',
            'location'       => 'required|string',
            'phone'          => 'required|string',
            'date'           => 'required|date|after_or_equal:today',
            'time'           => 'required',
            'payment_method' => 'required|in:cash,card',
            'notes'          => 'nullable|string',
        ]);

        $booking = Booking::create([
            'customer_id'    => $request->user()->id,
            'service_type'   => $request->service_type,
            'location'       => $request->location,
            'phone'          => $request->phone,
            'date'           => $request->date,
            'time'           => $request->time,
            'payment_method' => $request->payment_method,
            'notes'          => $request->notes,
            'status'         => 'pending',
        ]);

        // Notify all approved workers
        $workers = Worker::with('user')->where('status', 'approved')->get();
        foreach ($workers as $worker) {
            Notification::create([
                'user_id' => $worker->user_id,
                'title'   => '📋 New Booking Request!',
                'message' => 'A new ' . $request->service_type
                           . ' booking for ' . $request->date
                           . ' at ' . $request->time
                           . '. Location: ' . $request->location,
            ]);
        }

        // Notify admin
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title'   => '📋 New Booking Received!',
                'message' => $request->user()->username
                           . ' booked ' . $request->service_type
                           . ' for ' . $request->date . ' at ' . $request->time,
            ]);
        }

        return response()->json([
            'message' => 'Booking created successfully',
            'booking' => $booking->load('customer')
        ], 201);
    }

    // Customer views their bookings with worker details + rating
    public function customerBookings(Request $request)
    {
        $bookings = Booking::where('customer_id', $request->user()->id)
            ->with(['worker.worker', 'rating'])
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    // Worker views available bookings
    public function availableBookings(Request $request)
    {
        $bookings = Booking::where('status', 'pending')
            ->with('customer')
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    // Worker views their bookings
    public function workerBookings(Request $request)
    {
        $bookings = Booking::where('worker_id', $request->user()->id)
            ->with('customer')
            ->latest()
            ->get();

        return response()->json($bookings);
    }

    // Worker accepts a booking
    public function accept(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->status !== 'pending') {
            return response()->json([
                'message' => 'This booking is no longer available.'
            ], 400);
        }

        $booking->update([
            'worker_id' => $request->user()->id,
            'status'    => 'accepted',
        ]);

        $workerUser = $request->user()->load('worker');

        Notification::create([
            'user_id' => $booking->customer_id,
            'title'   => '✅ Booking Accepted!',
            'message' => 'Your ' . $booking->service_type
                       . ' booking for ' . $booking->date
                       . ' at ' . $booking->time
                       . ' has been accepted by ' . $workerUser->username
                       . ' (' . ($workerUser->worker->service_category ?? '') . ').',
        ]);

        return response()->json(['message' => 'Booking accepted successfully']);
    }

    // Worker marks as in progress
    public function inProgress(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->worker_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->update(['status' => 'in_progress']);

        Notification::create([
            'user_id' => $booking->customer_id,
            'title'   => '🔧 Work In Progress!',
            'message' => 'Your ' . $booking->service_type
                       . ' service has started. The worker is now on site.',
        ]);

        return response()->json(['message' => 'Status updated to in progress']);
    }

    // Worker marks as completed
    public function complete(Request $request, $id)
    {
        $booking = Booking::findOrFail($id);

        if ($booking->worker_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $booking->update(['status' => 'completed']);

        Notification::create([
            'user_id' => $booking->customer_id,
            'title'   => '🎉 Service Completed!',
            'message' => 'Your ' . $booking->service_type
                       . ' service has been completed! Please rate your worker.',
        ]);

        return response()->json(['message' => 'Booking completed']);
    }

    // Customer submits rating
    public function rate(Request $request, $id)
    {
        $request->validate([
            'stars'  => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:500',
        ]);

        $booking = Booking::findOrFail($id);

        if ($booking->customer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== 'completed') {
            return response()->json(['message' => 'Can only rate completed bookings'], 400);
        }

        // Check if already rated
        $existing = Rating::where('booking_id', $id)->first();
        if ($existing) {
            return response()->json(['message' => 'Already rated'], 400);
        }

        Rating::create([
            'booking_id'  => $id,
            'customer_id' => $request->user()->id,
            'worker_id'   => $booking->worker_id,
            'stars'       => $request->stars,
            'review'      => $request->review,
        ]);

        // Update worker avg rating
        $worker = Worker::where('user_id', $booking->worker_id)->first();
        if ($worker) {
            $ratings = Rating::where('worker_id', $booking->worker_id)->get();
            $avg     = $ratings->avg('stars');
            $worker->update([
                'avg_rating'    => round($avg, 2),
                'total_ratings' => $ratings->count(),
            ]);
        }

        return response()->json(['message' => 'Rating submitted successfully']);
    }

    // Customer triggers emergency
    public function emergency(Request $request)
    {
        $request->validate([
            'booking_id' => 'nullable|exists:bookings,id',
            'message'    => 'required|string',
        ]);

        $emergency = Emergency::create([
            'customer_id' => $request->user()->id,
            'booking_id'  => $request->booking_id,
            'message'     => $request->message,
        ]);

        // Notify admin urgently
        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title'   => '🚨 EMERGENCY ALERT!',
                'message' => 'Customer ' . $request->user()->username
                           . ' triggered an emergency! Message: '
                           . $request->message,
            ]);
        }

        return response()->json([
            'message'   => 'Emergency alert sent to admin.',
            'emergency' => $emergency
        ], 201);
    }

    // Admin views all emergencies
    public function allEmergencies()
    {
        $emergencies = Emergency::with(['customer', 'booking'])
            ->latest()
            ->get();

        return response()->json($emergencies);
    }

    // Admin resolves emergency
    public function resolveEmergency($id)
    {
        Emergency::findOrFail($id)->update(['is_resolved' => true]);
        return response()->json(['message' => 'Emergency resolved']);
    }

    // Customer cancels booking
    public function cancel($id)
    {
        $booking = Booking::findOrFail($id);
        $booking->update(['status' => 'cancelled']);
        return response()->json(['message' => 'Booking cancelled']);
    }

    // Admin views all bookings
    public function allBookings()
    {
        $bookings = Booking::with(['customer', 'worker'])
            ->latest()
            ->get();

        return response()->json($bookings);
    }
}