<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Tour;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $tours = Tour::all();
        if ($tours->isEmpty()) return;

        $customers = [
            ['name' => 'Priya Sharma',    'email' => 'priya.sharma@gmail.com',   'phone' => '9823001234'],
            ['name' => 'Rahul Deshmukh',  'email' => 'rahul.d@outlook.com',      'phone' => '9765004321'],
            ['name' => 'Anjali Mehta',    'email' => 'anjali.mehta@yahoo.com',   'phone' => '9890056789'],
            ['name' => 'Vikram Patil',    'email' => 'vikram.patil@gmail.com',   'phone' => '9823078901'],
            ['name' => 'Sneha Kulkarni',  'email' => 'sneha.kulkarni@gmail.com', 'phone' => '9765012345'],
            ['name' => 'Amit Joshi',      'email' => 'amit.joshi@hotmail.com',   'phone' => '9890034567'],
            ['name' => 'Kavita Rao',      'email' => 'kavita.rao@gmail.com',     'phone' => '9823056789'],
            ['name' => 'Deepak Wankhede', 'email' => 'deepak.w@gmail.com',       'phone' => '9765078901'],
        ];

        $statuses = ['pending', 'pending', 'confirmed', 'confirmed', 'confirmed', 'cancelled'];

        foreach ($customers as $i => $customer) {
            $tour = $tours[$i % $tours->count()];
            Booking::create([
                'tour_id'        => $tour->id,
                'customer_name'  => $customer['name'],
                'customer_email' => $customer['email'],
                'customer_phone' => $customer['phone'],
                'travel_date'    => now()->addDays(rand(15, 120))->toDateString(),
                'adults'         => rand(1, 4),
                'children'       => rand(0, 2),
                'message'        => $i % 3 === 0 ? 'Looking forward to the trip! Please confirm availability.' : null,
                'status'         => $statuses[$i % count($statuses)],
            ]);
        }
    }
}
