<?php

namespace App\Http\Controllers;

use App\Http\Resources\LeadResource;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LeadController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $leads = Lead::with('notes')->orderByDesc('created_at')->get();
        return LeadResource::collection($leads);
    }

    public function store(Request $request): LeadResource
    {
        $data = $request->validate([
            'name'         => 'required|string|min:2',
            'email'        => 'required|email',
            'phone'        => 'required|string|min:10',
            'tourInterest' => 'nullable|string',
            'message'      => 'required|string|min:1',
        ]);

        $lead = Lead::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'phone'         => $data['phone'],
            'tour_interest' => $data['tourInterest'] ?? null,
            'message'       => $data['message'],
            'source'        => 'manual',
            'status'        => 'new',
        ]);

        return new LeadResource($lead->load('notes'));
    }

    public function show(string $id): LeadResource
    {
        $lead = Lead::with('notes')->findOrFail($id);
        return new LeadResource($lead);
    }

    public function update(Request $request, string $id): JsonResponse|LeadResource
    {
        $lead = Lead::findOrFail($id);

        $request->validate([
            'status' => 'sometimes|in:new,contacted,in-progress,won,lost',
            'note'   => 'sometimes|string|min:1',
        ]);

        if (!$request->has('status') && !$request->has('note')) {
            return response()->json(['message' => 'Nothing to update'], 400);
        }

        if ($request->has('status')) {
            $lead->update(['status' => $request->status]);
        }

        if ($request->has('note')) {
            $lead->notes()->create([
                'content'      => $request->note,
                'author_name'  => auth('api')->user()->name,
                'author_email' => auth('api')->user()->email,
            ]);
        }

        return new LeadResource($lead->fresh()->load('notes'));
    }
}
