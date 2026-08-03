<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    protected $fillable = [
        'user_id', 'nic', 'service_category', 'experience',
        'nic_front', 'nic_back', 'police_report', 'other_docs',
        'bank_name', 'account_number', 'account_holder', 'branch',
        'status', 'rejection_reason'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}