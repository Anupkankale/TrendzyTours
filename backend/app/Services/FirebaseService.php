<?php

namespace App\Services;

use Kreait\Firebase\Factory;

class FirebaseService
{
    public function verifyToken(string $idToken): string
    {
        $credentialsPath = env('FIREBASE_CREDENTIALS');

        $factory = (new Factory())->withServiceAccount($credentialsPath);
        $auth = $factory->createAuth();

        $verifiedToken = $auth->verifyIdToken($idToken);

        return $verifiedToken->claims()->get('email');
    }
}
