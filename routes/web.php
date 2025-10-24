<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CarServiceController;

Route::get('/', [CarServiceController::class, 'index']);
Route::post('/search-client', [CarServiceController::class, 'searchClient']);
Route::get('/client/{id}/cars', [CarServiceController::class, 'getClientCars']);
Route::get('/client/{clientId}/car/{carSorszam}/services', [App\Http\Controllers\CarServiceController::class, 'getCarServices']);
