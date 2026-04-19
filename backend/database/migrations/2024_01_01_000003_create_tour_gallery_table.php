<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tour_gallery', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->foreignUuid('tour_id')->constrained()->cascadeOnDelete();
            $table->text('image_url');
            $table->unsignedInteger('position')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tour_gallery');
    }
};
