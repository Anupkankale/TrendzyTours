<?php

namespace App\Services;

use Illuminate\Support\Facades\Mail;

class EmailOtpService
{
    public function send(string $email, string $otp): bool
    {
        try {
            Mail::html($this->buildEmailHtml($otp), function ($message) use ($email) {
                $message->to($email)
                        ->subject('Your Trendzy Tours Verification Code');
            });

            return true;
        } catch (\Exception $e) {
            \Log::error('Email OTP send failed: ' . $e->getMessage());
            return false;
        }
    }

    private function buildEmailHtml(string $otp): string
    {
        return "
        <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff;'>
            <div style='text-align: center; margin-bottom: 32px;'>
                <h1 style='font-size: 24px; color: #1a1a2e; margin: 0;'>Trendzy Tours</h1>
                <p style='color: #6b7280; margin: 8px 0 0;'>Email Verification</p>
            </div>

            <p style='color: #374151; font-size: 15px; line-height: 1.6;'>
                Use the verification code below to confirm your email address. This code expires in <strong>10 minutes</strong>.
            </p>

            <div style='background: #f9f5eb; border-radius: 12px; padding: 28px; text-align: center; margin: 28px 0;'>
                <p style='margin: 0 0 8px; color: #6b7280; font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase;'>Your OTP Code</p>
                <p style='margin: 0; font-size: 42px; font-weight: 700; letter-spacing: 10px; color: #b8962e;'>{$otp}</p>
            </div>

            <p style='color: #9ca3af; font-size: 13px; line-height: 1.5;'>
                If you didn't request this, please ignore this email. Do not share this code with anyone.
            </p>

            <hr style='border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;'>
            <p style='color: #9ca3af; font-size: 12px; text-align: center; margin: 0;'>
                &copy; Trendzy Tours, Nagpur &nbsp;|&nbsp; trendzytours.com
            </p>
        </div>
        ";
    }
}
