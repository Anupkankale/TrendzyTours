<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsletterController extends Controller
{
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $apiKey = env('BREVO_API_KEY');
        $listId = env('BREVO_LIST_ID');

        if ($apiKey && $listId) {
            try {
                (new Client())->post('https://api.brevo.com/v3/contacts', [
                    'headers' => ['api-key' => $apiKey, 'Content-Type' => 'application/json'],
                    'json'    => [
                        'email'         => $request->email,
                        'listIds'       => [(int) $listId],
                        'updateEnabled' => true,
                    ],
                ]);
            } catch (\Exception $e) {
                \Log::warning('Newsletter subscription failed: ' . $e->getMessage());
            }
        }

        return response()->json(['success' => true]);
    }
}
