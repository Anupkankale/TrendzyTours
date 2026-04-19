<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'service' => 'Trendzy Tours API',
    'version' => '1.0',
    'status' => 'ok',
]));
