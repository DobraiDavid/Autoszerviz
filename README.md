# Autószerviz

## Használt technológiák és verziók
- PHP 8.2
- Laravel 12.35
- MariaDB 11.8
- JavaScript (Vanilla JS)
- Tailwind CSS
- Docker / Docker Compose

## Telepítés Dockerben
1. Klónozd a projektet:
    git clone https://github.com/DobraiDavid/Autoszerviz
    cd Autoszerviz
2. Másold az .env.example-t .env-re:
    cp .env.example .env
3. Telepítsd a Laravel függőségeket:
    docker compose run --rm app composer install
4. Indítsd el a konténereket:
    docker compose up --build -d
5. Generáld le az alkalmazás kulcsát:
    docker compose exec app php artisan key:generate
6. Telepítsd és buildeld a frontendet:
    npm install
    npm run build

## Kipróbálás
Az alkalmazás ezek után elérhető a http://localhost:8000 címen



