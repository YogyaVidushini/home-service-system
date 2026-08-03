<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
       User::create([
            'username' => 'admin',
            'email'    => 'admin@homeservice.com',
            'password' => Hash::make('Admin@123'),
            'role'     => 'admin',
        ]);
    }
}
