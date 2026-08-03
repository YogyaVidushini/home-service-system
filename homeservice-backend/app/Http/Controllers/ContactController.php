<?php
namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;


class ContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $admin = User::where('role', 'admin')->first();
        if ($admin) {
            Notification::create([
                'user_id' => $admin->id,
                'title'   => '📩 New Contact Message: ' . $request->subject,
                'message' => $request->name . ' (' . $request->email . ') says: ' . $request->message,
            ]);
        }

        return response()->json(['message' => 'Message sent successfully.'], 201);
    }
}