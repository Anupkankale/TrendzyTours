<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookingResource;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BookingController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $bookings = Booking::with('tour')->orderByDesc('created_at')->get();
        return BookingResource::collection($bookings);
    }

    public function show(string $id): BookingResource
    {
        $booking = Booking::with('tour')->findOrFail($id);
        return new BookingResource($booking);
    }

    public function update(Request $request, string $id): BookingResource|JsonResponse
    {
        $booking = Booking::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,cancelled',
        ]);

        $booking->update(['status' => $request->status]);

        return new BookingResource($booking->fresh()->load('tour'));
    }
}
