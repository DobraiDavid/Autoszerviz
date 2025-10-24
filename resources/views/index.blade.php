<!doctype html>
<html lang="hu">
<head>
    <meta charset="utf-8">
    <title>Autószerviz</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="bg-gray-50 text-gray-900 p-6">

<div class="max-w-5xl mx-auto">
    <h1 class="text-3xl font-bold mb-6 text-center">Autószerviz</h1>

    <!-- Search -->
    <div class="bg-white shadow-md rounded-2xl p-6 mb-6">
        <form id="searchForm" class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="searchName" class="block text-sm font-medium mb-1">Ügyfél neve</label>
                <input id="searchName" name="name" type="text"
                       class="w-full border border-black rounded-lg p-2">
            </div>
            <div>
                <label for="searchCard" class="block text-sm font-medium mb-1">Ügyfél okmányazonosítója</label>
                <input id="searchCard" name="card_number" type="text"
                       class="w-full border border-black rounded-lg p-2">
            </div>
            <div class="flex items-end">
                <button id="searchBtn" type="submit"
                        class="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition">
                    Keresés
                </button>
            </div>
        </form>
        <p id="searchErrors" class="text-red-500 mt-2"></p>
        <div id="searchResult" class="mt-3"></div>
    </div>

    <!-- Clients list -->
    <div class="bg-white shadow-md rounded-2xl p-6">
        <h2 class="text-xl font-semibold mb-3">Ügyfelek</h2>
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left">
                <thead class="bg-gray-100 text-gray-700 uppercase">
                <tr>
                    <th class="px-4 py-2">ID</th>
                    <th class="px-4 py-2">Név</th>
                    <th class="px-4 py-2">Okmányazonosító</th>
                </tr>
                </thead>
                <tbody id="clientsTbody" class="divide-y divide-gray-200">
                @foreach($clients as $client)
                <tr class="hover:bg-gray-50 transition" data-id="{{ $client->id }}">
                    <td class="px-4 py-2">{{ $client->id }}</td>
                    <td class="px-4 py-2 text-indigo-600 cursor-pointer font-medium client-name hover:underline">{{ $client->name }}</td>
                    <td class="px-4 py-2 client-card">{{ $client->card_number }}</td>
                </tr>
                <tr class="cars-row hidden" data-client="{{ $client->id }}">
                    <td colspan="3" class="p-0">
                        <div class="cars-container p-3 bg-gray-50 rounded-b-lg"></div>
                    </td>
                </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>
</div>
</body>
</html>
