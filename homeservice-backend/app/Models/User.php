<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'username', 'email', 'password',
        'role', 'phone', 'address', 'profile_photo'
    ];

    protected $hidden = ['password', 'remember_token'];

    public function worker()
    {
        return $this->hasOne(Worker::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}