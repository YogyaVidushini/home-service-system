<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\Rating;

class WorkerController extends Controller
{
    // Worker profile + status
    public function profile(Request $request)
    {
        $user = $request->user()->load('worker');
        return response()->json($user);
    }

    // Worker notifications
    public function notifications(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()->get();
        return response()->json($notifications);
    }

    // Mark notification as read
    public function markRead($id)
    {
        Notification::findOrFail($id)->update(['is_read' => true]);
        return response()->json(['message' => 'Marked as read']);
    }

    // Public worker profile (for customers to view)
     public function publicProfile($userId)
{
    $worker = \App\Models\Worker::with('user')
        ->where('user_id', $userId)
        ->firstOrFail();

    return response()->json([
        'username'      => $worker->user->username,
        'phone'         => $worker->user->phone,
        'experience'    => $worker->experience,
        'service_category'=> $worker->service_category,
        'avg_rating'    => $worker->avg_rating,
        'total_ratings' => $worker->total_ratings,
    ]);

    }
}