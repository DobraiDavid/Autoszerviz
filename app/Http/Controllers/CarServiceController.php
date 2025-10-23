<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Client;
use App\Models\Car;
use App\Models\Service;

class CarServiceController extends Controller
{
    public function index()
    {
        $clients = Client::orderBy('id')->get();
        return view('index', compact('clients'));
    }

    public function searchClient(Request $request)
    {
        $request->validate([
            'name' => 'nullable|string',
            'card_number' => 'nullable|alpha_num',
        ]);

        $name = $request->input('name');
        $card = $request->input('card_number');

        if (!$name && !$card) {
            return response()->json(['error' => 'Either client name or card number must be provided.'], 422);
        }
        if ($name && $card) {
            return response()->json(['error' => 'Fill only one field.'], 422);
        }

        if ($card) {
            $client = Client::where('card_number', $card)->first();
            if (!$client) {
                return response()->json(['error' => 'No client found with that card number.'], 404);
            }
            return $this->clientWithCountsResponse($client);
        }

        $clients = Client::where('name', 'like', "%{$name}%")->get();
        if ($clients->isEmpty()) {
            return response()->json(['error' => 'No client found with that name.'], 404);
        }
        if ($clients->count() > 1) {
            return response()->json(['error' => 'Multiple clients found — please be more specific.'], 422);
        }

        return $this->clientWithCountsResponse($clients->first());
    }

    protected function clientWithCountsResponse(Client $client)
    {
        return response()->json([
            'id' => $client->id,
            'name' => $client->name,
            'card_number' => $client->card_number,
            'cars_count' => $client->cars()->count(),
            'services_count' => $client->services()->count(),
        ]);
    }

    public function getClientCars($id)
    {
        $cars = Car::where('client_id', $id)
            ->orderBy('id')
            ->get()
            ->map(function ($car) {
                $last = $car->services()->orderByDesc('log_number')->first();

                $lastEvent = $last?->event;
                $lastEventTime = $last?->event_time;

                if ($lastEvent === 'regisztralt' && empty($lastEventTime)) {
                    $lastEventTime = $car->registered;
                }

                return [
                    'id' => $car->id,
                    'client_id' => $car->client_id,
                    'car_id' => $car->id,
                    'type' => $car->type,
                    'registered' => $car->registered,
                    'ownbrand' => (int) $car->ownbrand,
                    'accidents' => (int) $car->accidents,
                    'last_service' => [
                        'log_number' => $last?->log_number,
                        'event' => $lastEvent,
                        'event_time' => $lastEventTime,
                    ],
                ];
            });

        return response()->json($cars);
    }

    public function getCarServices($id)
    {
        $car = Car::find($id);
        if (!$car) {
            return response()->json(['error' => 'Car not found'], 404);
        }

        $services = Service::where('car_id', $car->id)
            ->orderBy('log_number')
            ->get()
            ->map(function ($s) use ($car) {
                $eventTime = $s->event_time ?: ($s->event === 'regisztralt' ? $car->registered : null);

                return [
                    'log_number' => (int) $s->log_number,
                    'event' => $s->event,
                    'event_time' => $eventTime,
                    'document_id' => $s->document_id,
                ];
            });

        return response()->json($services);
    }
}
