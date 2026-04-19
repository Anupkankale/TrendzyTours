<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'id'       => '11111111-1111-1111-1111-111111111111',
            'name'     => 'Admin User',
            'email'    => 'admin@trendzytours.com',
            'password' => Hash::make('admin123'),
            'role'     => 'admin',
        ]);

        User::create([
            'id'       => '22222222-2222-2222-2222-222222222222',
            'name'     => 'Sales Manager',
            'email'    => 'sales@trendzytours.com',
            'password' => Hash::make('sales123'),
            'role'     => 'sales',
        ]);

        User::create([
            'id'       => '33333333-3333-3333-3333-333333333333',
            'name'     => 'SEO Manager',
            'email'    => 'seo@trendzytours.com',
            'password' => Hash::make('seo12345'),
            'role'     => 'seo',
        ]);
    }
}
