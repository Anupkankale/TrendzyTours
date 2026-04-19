<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TourItineraryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'day'           => (int) $this->day,
            'title'         => $this->title,
            'description'   => $this->description,
            'meals'         => $this->meals ?? [],
            'accommodation' => $this->accommodation,
        ];
    }
}
