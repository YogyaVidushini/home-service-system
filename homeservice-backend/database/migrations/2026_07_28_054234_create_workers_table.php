<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('workers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('nic')->unique();
            $table->string('service_category');
            $table->integer('experience')->default(0);
            // Documents
            $table->string('nic_front')->nullable();
            $table->string('nic_back')->nullable();
            $table->string('police_report')->nullable();
            $table->string('other_docs')->nullable();
            // Bank
            $table->string('bank_name')->nullable();
            $table->string('account_number')->nullable();
            $table->string('account_holder')->nullable();
            $table->string('branch')->nullable();
            // Status
            $table->enum('status', ['pending', 'approved', 'rejected'])
                  ->default('pending');
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('workers');
    }
};