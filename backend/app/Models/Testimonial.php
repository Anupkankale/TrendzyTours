<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['name', 'city', 'tour_name', 'rating', 'quote', 'avatar_initials'];
}
