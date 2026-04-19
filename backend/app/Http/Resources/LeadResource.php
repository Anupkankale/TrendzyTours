<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'email'        => $this->email,
            'phone'        => $this->phone,
            'tourInterest' => $this->tour_interest,
            'message'      => $this->message,
            'status'       => $this->status,
            'source'       => $this->source,
            'notes'        => LeadNoteResource::collection($this->whenLoaded('notes')),
            'createdAt'    => $this->created_at->toISOString(),
            'updatedAt'    => $this->updated_at->toISOString(),
        ];
    }
}
