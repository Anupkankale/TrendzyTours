<?php

namespace Database\Seeders;

use App\Models\Testimonial;
use Illuminate\Database\Seeder;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $testimonials = [
            [
                'name'            => 'Priya Sharma',
                'city'            => 'Nagpur',
                'tour_name'       => 'Bali Bliss – 7 Nights',
                'rating'          => 5,
                'quote'           => 'Trendzy Tours made our Bali trip absolutely magical. Every detail was perfectly planned and the 24/7 support gave us total peace of mind. Will definitely book again!',
                'avatar_initials' => 'PS',
            ],
            [
                'name'            => 'Rajesh & Sunita Kulkarni',
                'city'            => 'Pune',
                'tour_name'       => 'Europe Grand Tour – 14 Nights',
                'rating'          => 5,
                'quote'           => 'Our Europe honeymoon was beyond expectations. The itinerary covered everything we wanted — Paris, Rome, Switzerland. The team was responsive and the hotels were excellent.',
                'avatar_initials' => 'RK',
            ],
            [
                'name'            => 'Meera Joshi',
                'city'            => 'Mumbai',
                'tour_name'       => 'Ladies Only – Kerala Discovery',
                'rating'          => 5,
                'quote'           => 'As a solo woman traveller, I felt completely safe and well looked after. The Ladies Only tour was a fabulous experience — met wonderful women from across India!',
                'avatar_initials' => 'MJ',
            ],
            [
                'name'            => 'Vikram Patel',
                'city'            => 'Ahmedabad',
                'tour_name'       => 'North Sikkim Adventure – 5 Nights',
                'rating'          => 5,
                'quote'           => 'The North Sikkim tour was breathtaking. Trendzy\'s local knowledge and guides made all the difference. Smooth logistics, great stays, and memories for a lifetime.',
                'avatar_initials' => 'VP',
            ],
            [
                'name'            => 'Anita & Suresh Desai',
                'city'            => 'Nagpur',
                'tour_name'       => 'Dubai Extravaganza – 5 Nights',
                'rating'          => 5,
                'quote'           => 'Superb value for money! The Dubai tour included all the must-sees. Trendzy handled everything seamlessly — from airport transfers to desert safari. Highly recommended.',
                'avatar_initials' => 'AD',
            ],
        ];

        foreach ($testimonials as $t) {
            Testimonial::create($t);
        }
    }
}
