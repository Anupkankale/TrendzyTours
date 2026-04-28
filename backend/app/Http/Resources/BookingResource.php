<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'tourId'        => $this->tour_id,
            'tourName'      => $this->tour?->name ?? '—',
            'tourSlug'      => $this->tour?->slug ?? '',
            'customerName'  => $this->customer_name,
            'customerEmail' => $this->customer_email,
            'customerPhone' => $this->customer_phone,
            'travelDate'    => $this->travel_date->toDateString(),
            'adults'        => $this->adults,
            'children'      => $this->children,
            'message'       => $this->message,
            'status'        => $this->status,
            'createdAt'     => $this->created_at->toISOString(),
            'updatedAt'     => $this->updated_at->toISOString(),
        ];
    }
}
