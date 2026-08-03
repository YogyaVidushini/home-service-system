<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'customer_id', 'worker_id', 'service_type',
        'location', 'phone', 'date', 'time',
        'payment_method', 'notes', 'status'
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function worker()
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function rating()
    {
        return $this->hasOne(Rating::class, 'booking_id');
    }
}