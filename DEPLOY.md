# Размещение YvnBet CMS v2 — следующий этап

В этой итерации подготовлена и проверена локальная версия. Команды размещения здесь — справочные; сервер не изменялся. Старые сведения о свободном порте 8095 относятся к сентябрю 2026 года и не доказывают, что он свободен сейчас.

## Конфигурация

Проверьте занятые порты командой `ss -ltnp`, выберите свободный, скопируйте `.env.example` в `.env` и заполните:

- `YVNBET_PORT`: выбранный порт хоста.
- `YVNBET_ORIGIN`: точный внешний адрес, например `https://site.example` (для временного демо допустим `http://IP:PORT`).
- `ADMIN_PASSWORD`: сильный пароль первого администратора, от 12 символов. Он нужен только при новой базе. Существующего пользователя переменная не меняет.
- `DATA_ENCRYPTION_KEY`: при желании отдельный 32-байтовый ключ в hex; без переменной ключ создастся в закрытом каталоге данных.

Не коммитьте `.env`. Выполните `chmod 600 .env`. Не используйте реальных посетителей и персональные данные на публичном HTTP-демо: рабочая конфигурация должна быть за HTTPS.

```sh
docker compose up -d --build
docker compose ps
docker compose logs --tail=50 web
```

Сборка контейнера включает сборку клиентского и серверного кода и тесты с временной БД. Рабочие данные хранятся в отдельном томе `site-data`. Контейнер работает от пользователя node с read-only корнем и writable томом данных. Состояние проверяется через `/api/health`.

Для HTTPS разместите reverse proxy перед приложением и ограничьте прямой доступ к порту. Укажите `PUBLIC_ORIGIN` через `YVNBET_ORIGIN`; в CMS задайте тот же HTTPS-домен в SEO-настройках. Только после наполнения сайта включите индексацию.

Бэкап должен согласованно включать SQLite (через SQLite backup API либо после остановки приложения), uploads и ключ шифрования. При использовании внешнего ключа храните его отдельно. Обычное копирование только `cms.sqlite` при активном WAL не является надёжным резервированием.

## Остановка

```sh
docker compose stop
```

`docker compose down` удаляет контейнер и сеть, сохраняя том. `docker compose down -v` безвозвратно удаляет том с контентом, сотрудниками, изображениями и заявками. Последняя команда здесь не выполнялась.

### Automatic language selection

The `/` entry URL chooses the saved manual language first, then the visitor's IP country (AM → hy, RU → ru), then the browser's supported language, then the CMS default. Explicit `/hy`, `/ru`, and `/en` links keep their language. Country lookup runs locally using the bundled geoip-country database; no external IP lookup request or browser location permission is used. VPN addresses can change the detected country. Keep the country database current with reviewed `npm update geoip-country` updates and rebuild the image. The package includes MaxMind GeoLite2 data and its license/EULA in node_modules/geoip-country.

When adding a reverse proxy, configure `TRUST_PROXY_HOPS` only for the actual trusted topology; do not blindly trust client-supplied forwarding or country headers. Direct Docker access by IP requires no additional setting.
