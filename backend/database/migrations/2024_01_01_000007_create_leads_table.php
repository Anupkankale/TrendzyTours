<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email');
            $table->string('phone');
            $table->string('tour_interest')->nullable();
            $table->text('message');
            $table->enum('status', ['new', 'contacted', 'in-progress', 'won', 'lost'])->default('new');
            $table->enum('source', ['contact-form', 'manual'])->default('contact-form');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
