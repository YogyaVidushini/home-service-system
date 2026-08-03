<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Emergency extends Model
{
    protected $fillable = ['customer_id', 'booking_id', 'message', 'is_resolved'];

    public function customer() { return $this->belongsTo(User::class, 'customer_id'); }
    public function booking()  { return $this->belongsTo(Booking::class); }
}