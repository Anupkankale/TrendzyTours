<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lead extends Model
{
    use HasUuids;

    protected $fillable = ['name', 'email', 'phone', 'tour_interest', 'message', 'status', 'source'];

    public function notes(): HasMany
    {
        return $this->hasMany(LeadNote::class)->orderBy('created_at');
    }
}
