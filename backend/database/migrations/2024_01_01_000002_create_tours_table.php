<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tours', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('slug')->unique();
            $table->string('name');
            $table->enum('category', ['domestic', 'world-travellers', 'cruise', 'ladies-only']);
            $table->string('region');
            $table->string('destination');
            $table->unsignedInteger('duration');
            $table->unsignedInteger('group_size_min');
            $table->unsignedInteger('group_size_max');
            $table->unsignedInteger('price_per_person');
            $table->text('hero_image');
            $table->text('short_description');
            $table->longText('description');
            $table->text('seo_description');
            $table->json('highlights');
            $table->json('inclusions');
            $table->json('exclusions');
            $table->boolean('featured')->default(false);
            $table->date('published_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tours');
    }
};
