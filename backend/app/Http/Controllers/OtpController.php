<?php

namespace App\Http\Controllers;

use App\Models\OtpVerification;
use App\Services\EmailOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OtpController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
        ]);

        // Rate limit: max 3 OTPs per email in 10 minutes
        $recentCount = OtpVerification::where('email', $data['email'])
            ->where('created_at', '>=', now()->subMinutes(10))
            ->count();

        if ($recentCount >= 3) {
            return response()->json([
                'message' => 'Too many OTP requests. Please wait 10 minutes before trying again.',
            ], 429);
        }

        $otp = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        OtpVerification::create([
            'email'      => $data['email'],
            'otp'        => $otp,
            'expires_at' => now()->addMinutes(10),
        ]);

        $sent = (new EmailOtpService())->send($data['email'], $otp);

        if (!$sent) {
            return response()->json(['message' => 'Failed to send OTP email. Please try again.'], 500);
        }

        return response()->json(['message' => 'OTP sent to your email.']);
    }

    public function verify(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $record = OtpVerification::where('email', $data['email'])
            ->where('otp', $data['otp'])
            ->whereNull('verified_at')
            ->latest()
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Invalid OTP.'], 422);
        }

        if ($record->isExpired()) {
            return response()->json(['message' => 'OTP has expired. Please request a new one.'], 422);
        }

        $emailToken = Str::uuid()->toString();

        $record->update([
            'verified_at' => now(),
            'email_token' => $emailToken,
        ]);

        return response()->json([
            'message'      => 'Email verified successfully.',
            'email_token'  => $emailToken,
        ]);
    }
}
