<?php

namespace Database\Seeders;

use App\Models\Destination;
use Illuminate\Database\Seeder;

class DestinationSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            [
                'name'               => 'Asia',
                'slug'               => 'asia',
                'image'              => 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=85&auto=format&fit=crop',
                'country_count'      => 18,
                'description'        => 'From spiritual Bali to royal Rajasthan',
                'featured_countries' => ['Bali', 'Thailand', 'Japan', 'Bhutan', 'India', 'Dubai'],
            ],
            [
                'name'               => 'Europe',
                'slug'               => 'europe',
                'image'              => 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=85&auto=format&fit=crop',
                'country_count'      => 24,
                'description'        => 'Timeless cities, alpine scenery and coastal magic',
                'featured_countries' => ['France', 'Italy', 'Switzerland', 'Greece', 'Spain', 'Netherlands'],
            ],
            [
                'name'               => 'Africa',
                'slug'               => 'africa',
                'image'              => 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=85&auto=format&fit=crop',
                'country_count'      => 12,
                'description'        => 'Wildlife safaris and stunning landscapes',
                'featured_countries' => ['Kenya', 'Tanzania', 'South Africa', 'Egypt', 'Morocco', 'Zanzibar'],
            ],
            [
                'name'               => 'Oceania',
                'slug'               => 'oceania',
                'image'              => 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=800&q=85&auto=format&fit=crop',
                'country_count'      => 6,
                'description'        => 'Australia, New Zealand and Pacific island paradises',
                'featured_countries' => ['Australia', 'New Zealand', 'Fiji', 'Maldives'],
            ],
            [
                'name'               => 'Latin America',
                'slug'               => 'latin-america',
                'image'              => 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=85&auto=format&fit=crop',
                'country_count'      => 10,
                'description'        => 'Ancient ruins, rainforests and vibrant cultures',
                'featured_countries' => ['Peru', 'Brazil', 'Argentina', 'Colombia', 'Costa Rica', 'Cuba'],
            ],
            [
                'name'               => 'North America',
                'slug'               => 'north-america',
                'image'              => 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=85&auto=format&fit=crop',
                'country_count'      => 4,
                'description'        => 'National parks, cities and coastal wonders',
                'featured_countries' => ['USA', 'Canada', 'Mexico', 'Caribbean'],
            ],
        ];

        foreach ($regions as $region) {
            Destination::create($region);
        }
    }
}
