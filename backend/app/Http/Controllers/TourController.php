<?php

namespace App\Http\Controllers;

use App\Http\Resources\TourResource;
use App\Models\Tour;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TourController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Tour::with(['gallery', 'itinerary']);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('region')) {
            $query->where('region', $request->region);
        }
        if ($request->filled('featured')) {
            $query->where('featured', filter_var($request->featured, FILTER_VALIDATE_BOOLEAN));
        }

        return TourResource::collection($query->get());
    }

    public function show(string $slug): TourResource
    {
        $tour = Tour::with(['gallery', 'itinerary'])->where('slug', $slug)->firstOrFail();
        return new TourResource($tour);
    }
}
