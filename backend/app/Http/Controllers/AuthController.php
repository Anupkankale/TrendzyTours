<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|min:6',
        ]);

        if (!$token = auth('api')->attempt($credentials)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        $cookie = cookie(
            'auth_token',
            $token,
            config('jwt.ttl', 10080),
            '/',
            null,
            false,
            true,
            false,
            'lax'
        );

        return response()
            ->json(['user' => new UserResource(auth('api')->user())])
            ->withCookie($cookie);
    }

    public function logout(): JsonResponse
    {
        auth('api')->logout();
        return response()
            ->json(['success' => true])
            ->withCookie(cookie()->forget('auth_token'));
    }

    public function me(): JsonResponse
    {
        return response()->json(['user' => new UserResource(auth('api')->user())]);
    }
}
