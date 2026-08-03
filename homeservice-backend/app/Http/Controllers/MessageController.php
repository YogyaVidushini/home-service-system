<?php
namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // Send a message
    public function store(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'booking_id'  => 'nullable|exists:bookings,id',
            'message'     => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'sender_id'   => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'booking_id'  => $request->booking_id,
            'message'     => $request->message,
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message->load('sender:id,username,role'), 201);
    }

    // Get conversation history with a specific user (optionally scoped to a booking)
    public function conversation(Request $request, $userId)
    {
        $me = $request->user()->id;

        $query = Message::where(function ($q) use ($me, $userId) {
                $q->where('sender_id', $me)->where('receiver_id', $userId);
            })
            ->orWhere(function ($q) use ($me, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $me);
            });

        if ($request->booking_id) {
            $query->where('booking_id', $request->booking_id);
        }

        $messages = $query->orderBy('created_at')->get();

        // Mark incoming messages as read
        Message::where('sender_id', $userId)
            ->where('receiver_id', $me)
            ->update(['is_read' => true]);

        return response()->json($messages);
    }

    // List all conversation threads for the logged-in user
    public function threads(Request $request)
    {
        $me = $request->user()->id;

        $messages = Message::where('sender_id', $me)->orWhere('receiver_id', $me)
            ->with(['sender:id,username,role', 'receiver:id,username,role'])
            ->latest()
            ->get();

        $threads = $messages->groupBy(function ($m) use ($me) {
            return $m->sender_id === $me ? $m->receiver_id : $m->sender_id;
        })->map(function ($group) use ($me) {
            $last = $group->first();
            $other = $last->sender_id === $me ? $last->receiver : $last->sender;
            return [
                'user'         => $other,
                'last_message' => $last->message,
                'last_time'    => $last->created_at,
                'unread_count' => $group->where('receiver_id', $me)->where('is_read', false)->count(),
            ];
        })->values();

        return response()->json($threads);
    }
}
