#!/bin/bash
set -e

echo "🚀 Setting up Trendzy Tours PHP Backend..."

if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running."
    echo "   In Docker Desktop: Settings → Resources → WSL Integration → enable your distro → Apply & Restart"
    exit 1
fi

BACKEND_DIR="$(pwd)/backend"

if [ -f "$BACKEND_DIR/vendor/autoload.php" ]; then
    echo "✅ Laravel already bootstrapped, skipping..."
else
    echo "📦 Bootstrapping Laravel (may take a few minutes)..."

    TEMP=$(mktemp -d)
    trap "rm -rf $TEMP" EXIT

    docker run --rm \
      -u "$(id -u):$(id -g)" \
      -v "$TEMP:/var/www/html" \
      -w /var/www/html \
      laravelsail/php83-composer:latest \
      composer create-project laravel/laravel . --prefer-dist --no-interaction

    # Merge base Laravel scaffolding; --ignore-existing preserves our custom files
    rsync -a --ignore-existing "$TEMP/" "$BACKEND_DIR/"

    # Remove default users migration — we have our own at 2024_01_01_000001_*
    rm -f "$BACKEND_DIR/database/migrations/0001_01_01_000000_create_users_table.php"

    echo "✅ Laravel bootstrapped"
fi

echo "📦 Installing PHP packages..."
docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$BACKEND_DIR:/var/www/html" \
  -w /var/www/html \
  laravelsail/php83-composer:latest \
  composer require tymon/jwt-auth guzzlehttp/guzzle

docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$BACKEND_DIR:/var/www/html" \
  -w /var/www/html \
  laravelsail/php83-composer:latest \
  composer require laravel/sail --dev

echo "🚢 Installing Laravel Sail..."
docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$BACKEND_DIR:/var/www/html" \
  -w /var/www/html \
  laravelsail/php83-composer:latest \
  php artisan sail:install --with=mysql --no-interaction

echo "🔑 Publishing JWT config..."
docker run --rm \
  -u "$(id -u):$(id -g)" \
  -v "$BACKEND_DIR:/var/www/html" \
  -w /var/www/html \
  laravelsail/php83-composer:latest \
  php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

echo "⚙️  Setting up .env..."
if [ ! -f "$BACKEND_DIR/.env" ]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
fi

echo ""
echo "✅ Setup complete! Run these next:"
echo ""
echo "   cd backend"
echo "   ./vendor/bin/sail up -d"
echo "   ./vendor/bin/sail artisan key:generate"
echo "   ./vendor/bin/sail artisan jwt:secret"
echo "   ./vendor/bin/sail artisan migrate:fresh --seed"
echo ""
echo "   Then start Nuxt: cd .. && npm run dev"
