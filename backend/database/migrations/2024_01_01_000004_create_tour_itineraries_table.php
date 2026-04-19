<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_itineraries', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignUuid('tour_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('day');
            $table->string('title');
            $table->text('description');
            $table->json('meals');
            $table->string('accommodation')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_itineraries');
    }
};
