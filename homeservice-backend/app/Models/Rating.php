<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Rating extends Model
{
    protected $fillable = [
        'booking_id', 'customer_id', 'worker_id', 'stars', 'review'
    ];

    public function worker()   { return $this->belongsTo(User::class, 'worker_id'); }
    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function booking()  { return $this->belongsTo(Booking::class); }
}