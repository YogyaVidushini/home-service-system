<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('status', [
                'pending',
                'accepted',
                'in_progress',
                'completed',
                'cancelled'
            ])->default('pending')->change();
        });

        Schema::table('workers', function (Blueprint $table) {
            $table->decimal('avg_rating', 3, 2)->default(0)->after('experience');
            $table->integer('total_ratings')->default(0)->after('avg_rating');
        });
    }
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
