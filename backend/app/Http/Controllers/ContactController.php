<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Models\OtpVerification;
use GuzzleHttp\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'         => 'required|string|min:2',
            'email'        => 'required|email',
            'phone'        => 'required|string|min:10',
            'emailToken'   => 'required|string',
            'tourInterest' => 'nullable|string',
            'message'      => 'required|string|min:10',
        ]);

        $verified = OtpVerification::where('email_token', $data['emailToken'])
            ->where('email', $data['email'])
            ->whereNotNull('verified_at')
            ->where('verified_at', '>=', now()->subMinutes(30))
            ->exists();

        if (!$verified) {
            return response()->json([
                'message' => 'Email not verified. Please verify your email with OTP first.',
                'errors'  => ['emailToken' => ['Email verification required.']],
            ], 422);
        }

        $lead = Lead::create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'phone'         => $data['phone'],
            'tour_interest' => $data['tourInterest'] ?? null,
            'message'       => $data['message'],
            'source'        => 'contact-form',
            'status'        => 'new',
        ]);

        $this->sendNotificationEmail($lead);

        return response()->json(['success' => true]);
    }

    private function sendNotificationEmail(Lead $lead): void
    {
        $apiKey      = env('BREVO_API_KEY');
        $notifyEmail = env('BREVO_NOTIFY_EMAIL', 'support@trendzytours.com');
        $senderEmail = env('BREVO_SENDER_EMAIL', 'noreply@trendzytours.com');

        if (!$apiKey) {
            return;
        }

        try {
            (new Client())->post('https://api.brevo.com/v3/smtp/email', [
                'headers' => ['api-key' => $apiKey, 'Content-Type' => 'application/json'],
                'json'    => [
                    'sender'      => ['name' => 'Trendzy Tours', 'email' => $senderEmail],
                    'to'          => [['email' => $notifyEmail]],
                    'subject'     => "New Enquiry from {$lead->name}",
                    'htmlContent' => "
                        <h2>New Contact Form Submission</h2>
                        <p><strong>Name:</strong> {$lead->name}</p>
                        <p><strong>Email:</strong> {$lead->email}</p>
                        <p><strong>Phone:</strong> {$lead->phone}</p>
                        <p><strong>Tour Interest:</strong> {$lead->tour_interest}</p>
                        <p><strong>Message:</strong> {$lead->message}</p>
                    ",
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Contact notification email failed: ' . $e->getMessage());
        }
    }
}
