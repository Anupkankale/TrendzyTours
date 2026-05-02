<?php

namespace App\Http\Controllers;

use App\Http\Resources\TourResource;
use App\Models\TourGallery;
use App\Models\TourItinerary;
use App\Models\Tour;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class TourController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Tour::with(['gallery', 'itinerary']);
        $query->whereNotNull('published_at');

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
        $tour = Tour::with(['gallery', 'itinerary'])
            ->where('slug', $slug)
            ->whereNotNull('published_at')
            ->firstOrFail();
        return new TourResource($tour);
    }

    public function adminIndex(): AnonymousResourceCollection
    {
        return TourResource::collection(
            Tour::with(['gallery', 'itinerary'])->latest('updated_at')->get()
        );
    }

    public function adminShow(string $id): TourResource
    {
        $tour = Tour::with(['gallery', 'itinerary'])->findOrFail($id);
        return new TourResource($tour);
    }

    public function store(Request $request): TourResource
    {
        $validated = $this->validateTour($request);

        $tour = DB::transaction(function () use ($validated) {
            $tour = Tour::create($this->mapTourAttributes($validated));
            $this->syncGallery($tour, $validated['gallery'] ?? []);
            $this->syncItinerary($tour, $validated['itinerary'] ?? []);

            return $tour->load(['gallery', 'itinerary']);
        });

        return new TourResource($tour);
    }

    public function update(Request $request, string $id): TourResource
    {
        $tour = Tour::with(['gallery', 'itinerary'])->findOrFail($id);
        $validated = $this->validateTour($request, $tour);

        DB::transaction(function () use ($tour, $validated) {
            $tour->update($this->mapTourAttributes($validated));

            if (array_key_exists('gallery', $validated)) {
                $this->syncGallery($tour, $validated['gallery'] ?? []);
            }

            if (array_key_exists('itinerary', $validated)) {
                $this->syncItinerary($tour, $validated['itinerary'] ?? []);
            }
        });

        return new TourResource($tour->fresh()->load(['gallery', 'itinerary']));
    }

    public function destroy(string $id): JsonResponse
    {
        $tour = Tour::findOrFail($id);

        if (Booking::where('tour_id', $tour->id)->exists()) {
            return response()->json([
                'message' => 'This tour has existing bookings and cannot be deleted.',
            ], 422);
        }

        $tour->delete();

        return response()->json(['ok' => true]);
    }

    private function validateTour(Request $request, ?Tour $tour = null): array
    {
        $required = $tour ? ['sometimes'] : ['required'];
        $nullableDate = $tour ? ['sometimes', 'nullable', 'date'] : ['nullable', 'date'];

        return $request->validate([
            'name' => [...$required, 'string', 'max:255'],
            'slug' => [...$required, 'string', 'max:255', Rule::unique('tours', 'slug')->ignore($tour?->id)],
            'category' => [...$required, Rule::in(['domestic', 'world-travellers', 'cruise', 'ladies-only'])],
            'region' => [...$required, 'string', 'max:255'],
            'destination' => [...$required, 'string', 'max:255'],
            'duration' => [...$required, 'integer', 'min:1'],
            'groupSize' => [...$required, 'array'],
            'groupSize.min' => [...$required, 'integer', 'min:1'],
            'groupSize.max' => [...$required, 'integer', 'gte:groupSize.min'],
            'pricePerPerson' => [...$required, 'integer', 'min:0'],
            'heroImage' => [...$required, 'string', 'max:2048'],
            'gallery' => [...$required, 'array', 'min:1'],
            'gallery.*' => ['string', 'max:2048'],
            'shortDescription' => [...$required, 'string'],
            'description' => [...$required, 'string'],
            'seoDescription' => [...$required, 'string'],
            'highlights' => [...$required, 'array', 'min:1'],
            'highlights.*' => ['string', 'max:255'],
            'inclusions' => [...$required, 'array', 'min:1'],
            'inclusions.*' => ['string', 'max:255'],
            'exclusions' => [...$required, 'array', 'min:1'],
            'exclusions.*' => ['string', 'max:255'],
            'itinerary' => [...$required, 'array', 'min:1'],
            'itinerary.*.day' => ['required_with:itinerary', 'integer', 'min:1'],
            'itinerary.*.title' => ['required_with:itinerary', 'string', 'max:255'],
            'itinerary.*.description' => ['required_with:itinerary', 'string'],
            'itinerary.*.meals' => ['required_with:itinerary', 'array'],
            'itinerary.*.meals.*' => ['string', 'max:255'],
            'itinerary.*.accommodation' => ['nullable', 'string', 'max:255'],
            'featured' => ['sometimes', 'boolean'],
            'publishedAt' => $nullableDate,
        ]);
    }

    private function mapTourAttributes(array $validated): array
    {
        $attributes = [];

        if (array_key_exists('name', $validated)) $attributes['name'] = $validated['name'];
        if (array_key_exists('slug', $validated)) $attributes['slug'] = $validated['slug'];
        if (array_key_exists('category', $validated)) $attributes['category'] = $validated['category'];
        if (array_key_exists('region', $validated)) $attributes['region'] = $validated['region'];
        if (array_key_exists('destination', $validated)) $attributes['destination'] = $validated['destination'];
        if (array_key_exists('duration', $validated)) $attributes['duration'] = $validated['duration'];
        if (array_key_exists('groupSize', $validated)) {
            $attributes['group_size_min'] = $validated['groupSize']['min'];
            $attributes['group_size_max'] = $validated['groupSize']['max'];
        }
        if (array_key_exists('pricePerPerson', $validated)) $attributes['price_per_person'] = $validated['pricePerPerson'];
        if (array_key_exists('heroImage', $validated)) $attributes['hero_image'] = $validated['heroImage'];
        if (array_key_exists('shortDescription', $validated)) $attributes['short_description'] = $validated['shortDescription'];
        if (array_key_exists('description', $validated)) $attributes['description'] = $validated['description'];
        if (array_key_exists('seoDescription', $validated)) $attributes['seo_description'] = $validated['seoDescription'];
        if (array_key_exists('highlights', $validated)) $attributes['highlights'] = $validated['highlights'];
        if (array_key_exists('inclusions', $validated)) $attributes['inclusions'] = $validated['inclusions'];
        if (array_key_exists('exclusions', $validated)) $attributes['exclusions'] = $validated['exclusions'];
        if (array_key_exists('featured', $validated)) $attributes['featured'] = $validated['featured'];
        if (array_key_exists('publishedAt', $validated)) $attributes['published_at'] = $validated['publishedAt'];

        return $attributes;
    }

    private function syncGallery(Tour $tour, array $gallery): void
    {
        $tour->gallery()->delete();

        foreach (array_values($gallery) as $index => $imageUrl) {
            TourGallery::create([
                'tour_id' => $tour->id,
                'image_url' => $imageUrl,
                'position' => $index,
            ]);
        }
    }

    private function syncItinerary(Tour $tour, array $itinerary): void
    {
        $tour->itinerary()->delete();

        foreach (array_values($itinerary) as $index => $day) {
            TourItinerary::create([
                'tour_id' => $tour->id,
                'day' => $day['day'] ?? ($index + 1),
                'title' => $day['title'],
                'description' => $day['description'],
                'meals' => $day['meals'],
                'accommodation' => $day['accommodation'] ?? null,
            ]);
        }
    }
}
