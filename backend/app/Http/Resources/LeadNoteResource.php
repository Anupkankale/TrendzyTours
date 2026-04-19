<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'content'     => $this->content,
            'authorName'  => $this->author_name,
            'authorEmail' => $this->author_email,
            'createdAt'   => $this->created_at->toISOString(),
        ];
    }
}
