import './bootstrap';

document.addEventListener('DOMContentLoaded', function () {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Search form
    const searchForm = document.getElementById('searchForm');
    const searchErrors = document.getElementById('searchErrors');
    const searchResult = document.getElementById('searchResult');

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        searchErrors.textContent = '';
        searchResult.innerHTML = '';

        const name = document.getElementById("searchName").value.trim();
        const card = document.getElementById("searchCard").value.trim();

        if (!name && !card) {
            searchErrors.textContent = "Töltsön ki vagy nevet, vagy okmányazonosítót.";
            return;
        }
        if (name && card) {
            searchErrors.textContent = "Csak az egyik mező tölthető ki.";
            return;
        }
        if (card && !/^[A-Za-z0-9]+$/.test(card)) {
            searchErrors.textContent = "Az okmányazonosító csak betűket és számokat tartalmazhat.";
            return;
        }

        const clients = Array.from(document.querySelectorAll("#clientsTbody tr[data-id]")).map(tr => ({
            id: tr.dataset.id,
            name: tr.querySelector(".client-name").textContent.trim(),
            card_number: tr.querySelector(".client-card").textContent.trim()
        }));

        if (name) {
            const matches = clients.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));

            if (matches.length === 0) {
                searchErrors.textContent = "Nincs találat ezzel a névvel.";
                return;
            }
            if (matches.length > 1) {
                searchErrors.textContent = "Több találat van ezzel a névvel, legyen pontosabb.";
                return;
            }
        }

        if (card) {
            const match = clients.find(c => c.card_number.toLowerCase() === card.toLowerCase());

            if (!match) {
                searchErrors.textContent = "Nincs találat ezzel az okmányazonosítóval.";
                return;
            }
        }

        const formData = new FormData(searchForm);

        fetch('/search-client', {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    searchErrors.textContent = data.error;
                } else {
                    searchResult.innerHTML = `
                        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p class="font-semibold text-green-800">Ügyfél megtalálva:</p>
                            <ul class="mt-2 space-y-1 text-sm">
                                <li><strong>ID:</strong> ${data.id}</li>
                                <li><strong>Név:</strong> ${data.name}</li>
                                <li><strong>Okmányazonosító:</strong> ${data.card_number}</li>
                                <li><strong>Autók száma:</strong> ${data.cars_count}</li>
                                <li><strong>Szerviznapló bejegyzések száma:</strong> ${data.services_count}</li>
                            </ul>
                        </div>
                    `;
                }
            })
            .catch(err => {
                searchErrors.textContent = 'Hiba történt a keresés során.';
                console.error(err);
            });
    });

    // Client name click - show cars
    document.querySelectorAll('.client-name').forEach(nameCell => {
        nameCell.addEventListener('click', function () {
            const row = this.closest('tr');
            const clientId = row.getAttribute('data-id');
            const carsRow = document.querySelector(`.cars-row[data-client="${clientId}"]`);
            const container = carsRow.querySelector('.cars-container');

            if (carsRow.classList.contains('hidden')) {
                fetch(`/client/${clientId}/cars`)
                    .then(res => res.json())
                    .then(cars => {
                        let html = '';

                        if (cars.length === 0) {
                            html = `<p class="font-semibold text-gray-500">Nincsenek autók</p>`;
                        } else {
                            html = '<h3 class="font-semibold mb-2">Autók</h3>';
                            html += '<table class="min-w-full text-sm border"><thead class="bg-gray-200"><tr>';
                            html += '<th class="px-3 py-2 border">Sorszám</th>';
                            html += '<th class="px-3 py-2 border">Típus</th>';
                            html += '<th class="px-3 py-2 border">Regisztrálás</th>';
                            html += '<th class="px-3 py-2 border">Saját márkás</th>';
                            html += '<th class="px-3 py-2 border">Balesetek</th>';
                            html += '<th class="px-3 py-2 border">Utolsó szerviz esemény</th>';
                            html += '<th class="px-3 py-2 border">Utolsó szerviz időpont</th>';
                            html += '</tr></thead><tbody>';

                            cars.forEach(c => {
                                html += `<tr class="hover:bg-gray-100">`;
                                html += `<td class="px-3 py-2 border text-indigo-600 cursor-pointer font-medium car-id hover:underline"
                                 data-car-db-id="${c.id}"
                                 data-car-sorszam="${c.car_sorszam}"
                                 data-client-id="${c.client_id}">${c.car_sorszam}</td>`;
                                html += `<td class="px-3 py-2 border">${c.type}</td>`;
                                html += `<td class="px-3 py-2 border">${c.registered || ''}</td>`;
                                html += `<td class="px-3 py-2 border">${c.ownbrand ? 'Igen' : 'Nem'}</td>`;
                                html += `<td class="px-3 py-2 border">${c.accidents}</td>`;
                                html += `<td class="px-3 py-2 border">${c.last_service.event || '-'}</td>`;
                                html += `<td class="px-3 py-2 border">${c.last_service.event_time || '-'}</td>`;
                                html += `</tr>`;
                                html += `<tr class="services-row hidden" data-client="${c.client_id}" data-car-sorszam="${c.car_sorszam}">`;
                                html += `<td colspan="7" class="p-0"><div class="services-container p-3 bg-blue-50"></div></td>`;
                                html += `</tr>`;
                            });

                            html += '</tbody></table>';
                        }

                        container.innerHTML = html;
                        attachCarClickEvents();
                        carsRow.classList.remove('hidden');

                    })
                    .catch(err => console.error(err));
            } else {
                carsRow.classList.add('hidden');
            }
        });
    });

    // Function to attach car click events
    function attachCarClickEvents() {
        document.querySelectorAll('.car-id').forEach(carCell => {
            carCell.addEventListener('click', function () {
                const carSorszam = this.getAttribute('data-car-sorszam');
                const clientId = this.getAttribute('data-client-id');

                console.log('Clicking car:', { clientId, carSorszam });

                const servicesRow = document.querySelector(`.services-row[data-client="${clientId}"][data-car-sorszam="${carSorszam}"]`);
                const container = servicesRow.querySelector('.services-container');

                if (servicesRow.classList.contains('hidden')) {
                    fetch(`/client/${clientId}/car/${carSorszam}/services`)
                        .then(res => {
                            console.log('Response status:', res.status);
                            return res.json();
                        })
                        .then(services => {
                            console.log('Services received:', services);

                            if (services.error) {
                                container.innerHTML = `<p class="text-red-600">${services.error}</p>`;
                                servicesRow.classList.remove('hidden');
                                return;
                            }

                            let html = '<h4 class="font-semibold mb-2">Szerviznapló</h4>';
                            html += '<table class="min-w-full text-sm border"><thead class="bg-blue-100"><tr>';
                            html += '<th class="px-3 py-2 border">Alkalom sorszáma</th>';
                            html += '<th class="px-3 py-2 border">Esemény neve</th>';
                            html += '<th class="px-3 py-2 border">Esemény időpontja</th>';
                            html += '<th class="px-3 py-2 border">Munkalap azonosító</th>';
                            html += '</tr></thead><tbody>';

                            if (services.length === 0) {
                                html += `<tr><td colspan="4" class="px-3 py-2 border text-center text-gray-500">Nincs szerviznapló bejegyzés</td></tr>`;
                            } else {
                                services.forEach(s => {
                                    html += `<tr class="hover:bg-blue-50">`;
                                    html += `<td class="px-3 py-2 border">${s.log_number}</td>`;
                                    html += `<td class="px-3 py-2 border">${s.event}</td>`;
                                    html += `<td class="px-3 py-2 border">${s.event_time || '-'}</td>`;
                                    html += `<td class="px-3 py-2 border">${s.document_id || '-'}</td>`;
                                    html += `</tr>`;
                                });
                            }

                            html += '</tbody></table>';
                            container.innerHTML = html;
                            servicesRow.classList.remove('hidden');
                        })
                        .catch(err => {
                            console.error('Error fetching services:', err);
                            container.innerHTML = `<p class="text-red-600">Hiba történt a szerviznapló betöltése során.</p>`;
                            servicesRow.classList.remove('hidden');
                        });
                } else {
                    servicesRow.classList.add('hidden');
                }
            });
        });
    }
});
