# YvnBet: первый запуск на новом Ubuntu-сервере

Команды ниже выполняются на новом сервере от root (`sudo -i`). Они создают новую установку с пустой базой. Если нужно сохранить существующий контент админки, пользователей и заявки, сначала перенесите Docker-том старой установки: Git этих данных не содержит. Информация о резервировании находится в [DEPLOY.md](DEPLOY.md).

## 1. Git и Docker Compose

Если `docker version` и `docker compose version` уже работают, установите только Git при необходимости и переходите к шагу 2. Команды установки ниже предназначены для чистой Ubuntu 22.04/24.04/26.04 без ранее установленных альтернативных пакетов Docker.

```bash
apt-get update
apt-get install -y ca-certificates curl git nano
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc

tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
docker version
docker compose version
```

Источник: [официальная инструкция Docker для Ubuntu](https://docs.docker.com/engine/install/ubuntu/).

## 2. Скачать проект — один раз

```bash
git clone https://github.com/gagikabovyan98/yvnbet.git /opt/yvnbet
cd /opt/yvnbet
ss -ltnp
```

Выберите свободный порт; далее используется 8095. Если каталог `/opt/yvnbet` уже существует, не удаляйте его: проверьте, не находится ли там действующая установка. Для неё используйте раздел обновления ниже.

## 3. Настроить новую установку

```bash
cd /opt/yvnbet
cp -n .env.example .env
chmod 600 .env
nano .env
```

Заполните `.env`, подставив IP нового сервера и свой новый пароль (не менее 12 символов):

```dotenv
YVNBET_PORT=8095
YVNBET_ORIGIN=http://IP_НОВОГО_СЕРВЕРА:8095
ADMIN_PASSWORD=ВАШ_НОВЫЙ_ДЛИННЫЙ_ПАРОЛЬ
DATA_ENCRYPTION_KEY=
```

`YVNBET_ORIGIN` должен точно совпадать с адресом в браузере, включая схему и порт, без завершающего `/`. Иначе вход в админку блокируется проверкой источника запроса. Не оставляйте `localhost`, если открываете сайт по внешнему IP. Если пароль содержит `$`, используйте одинарные кавычки вокруг значения в `.env`.

Пустой `DATA_ENCRYPTION_KEY` означает, что приложение создаст ключ в томе данных. Пароль администратора применяется только при создании новой базы.

## 4. Собрать и запустить

```bash
cd /opt/yvnbet
docker compose up -d --build --wait --wait-timeout 120 web
docker compose ps
curl -fsS http://127.0.0.1:8095/api/health
```

Ожидаемый ответ: `{"ok":true}`. При ошибке:

```bash
docker compose logs --tail=100 web
```

Сайт: `http://IP_НОВОГО_СЕРВЕРА:8095/`. Админка: `http://IP_НОВОГО_СЕРВЕРА:8095/login/yvn/admin`, логин `admin`, пароль из `.env`. Для проверки сайта по IP порт должен быть доступен в сетевых правилах провайдера сервера. Это временный режим до подключения HTTPS.

## 5. Последующие обновления

```bash
cd /opt/yvnbet &&
git pull --ff-only origin main &&
docker compose up -d --build --wait --wait-timeout 120 web
```

Контент админки и загруженные файлы сохраняются в Docker-томе при обычной пересборке. Не используйте `docker compose down -v`, если данные нужны.

## 6. Когда будете подключать Nginx и домен

У этого проекта один сервис: он обслуживает и сайт, и API. Достаточно схемы `https://DOMAIN → Nginx → http://127.0.0.1:8095`. Отдельный порт или поддомен для API не требуется.

При переходе на HTTPS измените `.env`:

```dotenv
YVNBET_PORT=127.0.0.1:8095
YVNBET_ORIGIN=https://ВАШ_ДОМЕН
```

Так опубликованный Docker-порт будет доступен только локально. Затем пересоздайте сервис командой из шага 4. В админке укажите тот же домен в SEO-настройках.

Для определения страны за единственным локальным Nginx добавьте `compose.override.yaml`:

```yaml
services:
  web:
    environment:
      TRUST_PROXY_HOPS: "1"
```

В таком варианте Nginx должен передавать `proxy_set_header X-Forwarded-For $remote_addr;` и `proxy_set_header X-Forwarded-Proto $scheme;`. Эта настройка доверия рассчитана именно на один Nginx и закрытый внешний доступ к порту приложения. При добавлении Cloudflare или других прокси схему нужно пересмотреть.

Автовыбор языка действует на `/`: сохранённый ручной выбор → IP-страна (AM — армянский, RU — русский) → язык браузера → язык по умолчанию в CMS. Прямые ссылки `/hy`, `/ru`, `/en` сохраняют указанный язык.
