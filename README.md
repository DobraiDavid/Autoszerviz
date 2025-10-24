# Autószerviz

## Használt technológiák és verziók
- PHP 8.2
- Laravel 12.35
- MariaDB 11.8
- JavaScript (Vanilla JS)
- Tailwind CSS
- Docker / Docker Compose

## Telepítés Dockerben
1. Klónozd a projektet:<br>
    git clone https://github.com/DobraiDavid/Autoszerviz<br>
    cd Autoszerviz<br>
2. Másold az .env.example-t .env-re:<br>
    cp .env.example .env<br>
3. Telepítsd a Laravel függőségeket:<br>
    docker compose run --rm app composer install<br>
4. Indítsd el a konténereket:<br>
    docker compose up --build -d<br>
5. Generáld le az alkalmazás kulcsát:<br>
    docker compose exec app php artisan key:generate<br>
6. Futtasd le az adatbázis migrációkat:<br>
    docker compose exec app php artisan migrate --seed<br>
7. Telepítsd és buildeld a frontendet:<br>
    npm install<br>
    npm run build<br>

## Kipróbálás
Az alkalmazás ezek után elérhető a http://localhost:8000 címen



