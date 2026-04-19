<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tour extends Model
{
    use HasUuids;

    protected $fillable = [
        'slug', 'name', 'category', 'region', 'destination', 'duration',
        'group_size_min', 'group_size_max', 'price_per_person', 'hero_image',
        'short_description', 'description', 'seo_description',
        'highlights', 'inclusions', 'exclusions', 'featured', 'published_at',
    ];

    protected $casts = [
        'highlights' => 'array',
        'inclusions' => 'array',
        'exclusions' => 'array',
        'featured'   => 'boolean',
    ];

    public function gallery(): HasMany
    {
        return $this->hasMany(TourGallery::class)->orderBy('position');
    }

    public function itinerary(): HasMany
    {
        return $this->hasMany(TourItinerary::class)->orderBy('day');
    }
}
