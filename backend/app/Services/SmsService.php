<?php

namespace App\Services;

use GuzzleHttp\Client;

class SmsService
{
    private Client $client;
    private string $authKey;
    private string $senderId;
    private string $templateId;

    public function __construct()
    {
        $this->client     = new Client();
        $this->authKey    = env('MSG91_AUTH_KEY', '');
        $this->senderId   = env('MSG91_SENDER_ID', 'TRZTUR');
        $this->templateId = env('MSG91_TEMPLATE_ID', '');
    }

    public function sendOtp(string $phone, string $otp): bool
    {
        if (!$this->authKey) {
            \Log::info("SMS skipped (no MSG91_AUTH_KEY). OTP for {$phone}: {$otp}");
            return true;
        }

        $mobile = preg_replace('/\D/', '', $phone);
        if (strlen($mobile) === 10) {
            $mobile = '91' . $mobile;
        }

        try {
            $response = $this->client->post('https://api.msg91.com/api/v5/otp', [
                'headers' => [
                    'authkey'      => $this->authKey,
                    'Content-Type' => 'application/json',
                    'Accept'       => 'application/json',
                ],
                'json' => [
                    'template_id' => $this->templateId,
                    'mobile'      => $mobile,
                    'authkey'     => $this->authKey,
                    'otp'         => $otp,
                ],
            ]);

            $body = json_decode($response->getBody()->getContents(), true);
            return ($body['type'] ?? '') === 'success';
        } catch (\Exception $e) {
            \Log::error('SMS send failed: ' . $e->getMessage());
            return false;
        }
    }
}
