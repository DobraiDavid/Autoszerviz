<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use App\Models\Client;
use App\Models\Car;
use App\Models\Service;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Seed Clients
        if (Client::count() === 0) {
            $clientsJson = Storage::disk('local')->get('clients.json');
            $clients = json_decode($clientsJson, true);

            foreach ($clients as $c) {
                Client::create([
                    'id' => $c['id'],
                    'name' => $c['name'],
                    'card_number' => $c['idcard'],
                ]);
            }
        }

        // Seed Cars
        if (Car::count() === 0) {
            $carsJson = Storage::disk('local')->get('cars.json');
            $cars = json_decode($carsJson, true);

            foreach ($cars as $c) {
                Car::create([
                    'id' => $c['id'],
                    'client_id' => $c['client_id'],
                    'type' => $c['type'],
                    'registered' => $c['registered'],
                    'ownbrand' => $c['ownbrand'],
                    'accidents' => $c['accident'] ?? 0,
                ]);
            }
        }

        // Seed Services
        if (Service::count() === 0) {
            $servicesJson = Storage::disk('local')->get('services.json');
            $services = json_decode($servicesJson, true);

            foreach ($services as $s) {
                Service::create([
                    'id' => $s['id'],
                    'client_id' => $s['client_id'],
                    'car_id' => $s['car_id'],
                    'log_number' => $s['lognumber'],
                    'event' => $s['event'],
                    'event_time' => $s['eventtime'],
                    'document_id' => $s['document_id'],
                ]);
            }
        }
    }
}
