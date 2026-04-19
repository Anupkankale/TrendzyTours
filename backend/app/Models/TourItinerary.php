<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TourItinerary extends Model
{
    public $timestamps = false;

    protected $fillable = ['tour_id', 'day', 'title', 'description', 'meals', 'accommodation'];

    protected $casts = ['meals' => 'array'];

    public function tour(): BelongsTo
    {
        return $this->belongsTo(Tour::class);
    }
}
