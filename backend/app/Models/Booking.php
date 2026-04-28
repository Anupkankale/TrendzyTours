<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasUuids;

    protected $fillable = [
        'tour_id', 'customer_name', 'customer_email', 'customer_phone',
        'travel_date', 'adults', 'children', 'message', 'status',
    ];

    protected $casts = [
        'travel_date' => 'date',
        'adults'      => 'integer',
        'children'    => 'integer',
    ];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
