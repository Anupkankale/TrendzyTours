<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'slug'             => $this->slug,
            'name'             => $this->name,
            'category'         => $this->category,
            'region'           => $this->region,
            'destination'      => $this->destination,
            'duration'         => (int) $this->duration,
            'groupSize'        => [
                'min' => (int) $this->group_size_min,
                'max' => (int) $this->group_size_max,
            ],
            'pricePerPerson'   => (int) $this->price_per_person,
            'heroImage'        => $this->hero_image,
            'gallery'          => $this->whenLoaded('gallery', fn () => $this->gallery->pluck('image_url')->values()),
            'shortDescription' => $this->short_description,
            'description'      => $this->description,
            'seoDescription'   => $this->seo_description,
            'highlights'       => $this->highlights,
            'inclusions'       => $this->inclusions,
            'exclusions'       => $this->exclusions,
            'itinerary'        => TourItineraryResource::collection($this->whenLoaded('itinerary')),
            'featured'         => (bool) $this->featured,
            'publishedAt'      => $this->published_at,
            'updatedAt'        => optional($this->updated_at)->toDateString(),
        ];
    }
}
