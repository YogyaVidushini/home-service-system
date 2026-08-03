<?php
namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Worker;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    // Customer Register
    public function registerCustomer(Request $request)
    {
        $request->validate([
            'username'  => 'required|unique:users',
            'fullName'  => 'required|string',
            'email'     => 'required|email|unique:users',
            'phone'     => 'required',
            'address'   => 'required',
            'password'  => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'customer',
            'phone'    => $request->phone,
            'address'  => $request->address,
        ]);

        return response()->json([
            'message' => 'Customer registered successfully',
            'user'    => $user
        ], 201);
    }

    // Worker Register
    public function registerWorker(Request $request)
    {
        $request->validate([
            'username'        => 'required|unique:users',
            'fullName'        => 'required',
            'email'           => 'required|email|unique:users',
            'phone'           => 'required',
            'nic'             => 'required|unique:workers',
            'address'         => 'required',
            'serviceCategory' => 'required',
            'password'        => 'required|min:8|confirmed',
            'nicFront'        => 'required|file|mimes:jpg,jpeg,png,pdf',
            'nicBack'         => 'required|file|mimes:jpg,jpeg,png,pdf',
            'policeReport'    => 'required|file|mimes:jpg,jpeg,png,pdf',
            'bankName'        => 'required',
            'accountNumber'   => 'required',
            'accountHolder'   => 'required',
            'branch'          => 'required',
        ]);

        // Store files
        $nicFront     = $request->file('nicFront')->store('workers/docs', 'public');
        $nicBack      = $request->file('nicBack')->store('workers/docs', 'public');
        $policeReport = $request->file('policeReport')->store('workers/docs', 'public');
        $otherDocs    = $request->hasFile('otherDocs')
                        ? $request->file('otherDocs')->store('workers/docs', 'public')
                        : null;

        // Create user
        $user = User::create([
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'worker',
            'phone'    => $request->phone,
            'address'  => $request->address,
        ]);

        // Create worker profile
        Worker::create([
            'user_id'          => $user->id,
            'nic'              => $request->nic,
            'service_category' => $request->serviceCategory,
            'experience'       => $request->experience ?? 0,
            'nic_front'        => $nicFront,
            'nic_back'         => $nicBack,
            'police_report'    => $policeReport,
            'other_docs'       => $otherDocs,
            'bank_name'        => $request->bankName,
            'account_number'   => $request->accountNumber,
            'account_holder'   => $request->accountHolder,
            'branch'           => $request->branch,
            'status'           => 'pending',
        ]);

        return response()->json([
            'message' => 'Worker application submitted. Pending approval.'
        ], 201);
    }

    // Login (all roles)
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required',
            'password' => 'required',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Block pending/rejected workers
        if ($user->role === 'worker') {
            $worker = $user->worker;
            if ($worker->status === 'pending') {
                return response()->json([
                    'message' => 'Your account is pending approval.'
                ], 403);
            }
            if ($worker->status === 'rejected') {
                return response()->json([
                    'message' => 'Your application was rejected: ' 
                                  . $worker->rejection_reason
                ], 403);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'role'  => $user->role,
            'user'  => $user,
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out']);
    }
}