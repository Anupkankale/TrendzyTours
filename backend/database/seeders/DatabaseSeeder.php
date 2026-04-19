<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            TourSeeder::class,
            DestinationSeeder::class,
            TestimonialSeeder::class,
        ]);
    }
}
