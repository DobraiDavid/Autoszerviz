document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    const clientsTable = document.getElementById("clientsTbody");
    const searchForm = document.getElementById("searchForm");
    const searchErrors = document.getElementById("searchErrors");
    const searchResult = document.getElementById("searchResult");

    // Fetch helper function
    const fetchJSON = async (url, options = {}) => {
        const res = await fetch(url, {
            headers: { "X-CSRF-TOKEN": csrfToken, "Content-Type": "application/json" },
            ...options,
        });
        if (!res.ok) throw await res.json();
        return res.json();
    };

    // Click on client name → show cars
    clientsTable.addEventListener("click", async (e) => {
        const nameCell = e.target.closest(".client-name");
        if (!nameCell) return;

        const tr = nameCell.closest("tr");
        const clientId = tr.dataset.id;
        const carsRow = document.querySelector(`.cars-row[data-client="${clientId}"]`);
        const container = carsRow.querySelector(".cars-container");

        // toggle visibility
        const isVisible = !carsRow.classList.contains("hidden");
        document.querySelectorAll(".cars-row").forEach(row => row.classList.add("hidden"));
        if (isVisible) return;
        carsRow.classList.remove("hidden");
        container.innerHTML = `<div class="text-gray-500">Betöltés...</div>`;

        try {
            const cars = await fetchJSON(`/client/${clientId}/cars`);
            if (!cars.length) {
                container.innerHTML = `<div class="text-gray-500">Nincsenek autók</div>`;
                return;
            }

            const rows = cars.map(car => `
        <tr class="hover:bg-gray-100 transition" data-car="${car.id}">
          <td class="car-id text-indigo-600 cursor-pointer hover:underline">${car.car_id}</td>
          <td>${car.type || ""}</td>
          <td>${car.registered || ""}</td>
          <td>${car.ownbrand ? "igen" : "nem"}</td>
          <td>${car.accidents ?? 0}</td>
          <td>${car.last_service?.event ?? ""}</td>
          <td>${car.last_service?.event_time ?? ""}</td>
        </tr>
      `).join("");

            container.innerHTML = `
        <table class="min-w-full text-sm mt-2">
          <thead class="bg-gray-100 uppercase">
            <tr>
              <th>id</th><th>típus</th><th>regisztrálva</th>
              <th>saját márkás</th><th>balesetek</th><th>utolsó esemény</th><th>utolsó időpont</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
        } catch (err) {
            container.innerHTML = `<div class="text-red-500">Hiba a szerverrel</div>`;
        }
    });

    // Click on car id → show services
    clientsTable.addEventListener("click", async (e) => {
        const carCell = e.target.closest(".car-id");
        if (!carCell) return;

        const row = carCell.closest("tr");
        const carId = row.dataset.car;
        row.nextElementSibling?.remove();

        const newRow = document.createElement("tr");
        newRow.innerHTML = `<td colspan="7" class="py-2 text-gray-500">Betöltés...</td>`;
        newRow.classList.add("services-row");
        row.insertAdjacentElement("afterend", newRow);

        try {
            const services = await fetchJSON(`/car/${carId}/services`);
            if (!services.length) {
                newRow.innerHTML = `<td colspan="7" class="text-gray-500">Nincs szerviznapló bejegyzés</td>`;
                return;
            }

            const rows = services.map(s => `
        <tr>
          <td>${s.log_number}</td>
          <td>${s.event}</td>
          <td>${s.event_time || ""}</td>
          <td>${s.document_id || ""}</td>
        </tr>
      `).join("");

            newRow.innerHTML = `
        <td colspan="7">
          <table class="min-w-full text-sm mt-2">
            <thead class="bg-gray-100 uppercase">
              <tr><th>lognumber</th><th>esemény</th><th>időpont</th><th>munkalap id</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </td>
      `;
        } catch (err) {
            newRow.innerHTML = `<td colspan="7" class="text-red-500">Hiba a szerverrel</td>`;
        }
    });

    // Search form
    searchForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        searchErrors.textContent = "";
        searchResult.innerHTML = "";

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

        searchResult.innerHTML = `<div class="text-gray-500">Keresés folyamatban...</div>`;

        try {
            const data = await fetchJSON("/search-client", {
                method: "POST",
                body: JSON.stringify({ name: name || null, card_number: card || null }),
            });

            searchResult.innerHTML = `
        <div class="bg-green-100 border border-green-300 text-green-800 p-3 rounded-lg">
          <p><strong>Ügyfélazonosító:</strong> ${data.id}</p>
          <p><strong>Név:</strong> ${data.name}</p>
          <p><strong>Okmányazonosító:</strong> ${data.card_number}</p>
          <p><strong>Autók száma:</strong> ${data.cars_count}</p>
          <p><strong>Szerviz bejegyzések száma:</strong> ${data.services_count}</p>
        </div>
      `;
        } catch (err) {
            searchResult.innerHTML = `<div class="text-red-500">Hiba: ${err.error || "Ismeretlen hiba"}</div>`;
        }
    });
});
