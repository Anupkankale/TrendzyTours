<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Models\Tour;
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

    public function store(Request $request): BookingResource
    {
        $data = $request->validate([
            'tourId'        => 'required|uuid|exists:tours,id',
            'customerName'  => 'required|string|min:2',
            'customerEmail' => 'required|email',
            'customerPhone' => 'required|string|min:10',
            'travelDate'    => 'required|date|after:today',
            'adults'        => 'required|integer|min:1',
            'children'      => 'nullable|integer|min:0',
            'message'       => 'nullable|string',
            'source'        => 'required|in:call,reference,walk-in',
            'status'        => 'nullable|in:pending,confirmed',
        ]);

        $booking = Booking::create([
            'tour_id'        => $data['tourId'],
            'customer_name'  => $data['customerName'],
            'customer_email' => $data['customerEmail'],
            'customer_phone' => $data['customerPhone'],
            'travel_date'    => $data['travelDate'],
            'adults'         => $data['adults'],
            'children'       => $data['children'] ?? 0,
            'message'        => $data['message'] ?? null,
            'source'         => $data['source'],
            'status'         => $data['status'] ?? 'pending',
        ]);

        return new BookingResource($booking->load('tour'));
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
