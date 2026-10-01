import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Gamepad2,
  Layers,
  Image,
  Gift,
  HelpCircle,
  FileText,
  Settings,
  Search,
  Languages,
  Users,
  Inbox,
  ShieldCheck,
  LogOut,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Save,
  ExternalLink,
  ChevronRight,
  Upload,
  CheckCircle2,
} from "lucide-react";
import { initialContent } from "./content.mjs";
const groups = [
  ["overview", "Обзор", LayoutDashboard],
  ["games", "Игры", Gamepad2],
  ["providers", "Провайдеры", Layers],
  ["categories", "Категории", Layers],
  ["slides", "Слайдер", Image],
  ["promotions", "Акции и новости", Gift],
  ["faq", "Вопросы и ответы", HelpCircle],
  ["pages", "Страницы", FileText],
  ["interface", "Тексты интерфейса", Languages],
  ["seo", "SEO", Search],
  ["settings", "Настройки", Settings],
  ["leads", "Заявки", Inbox],
  ["users", "Команда и доступ", Users],
  ["audit", "Журнал действий", ShieldCheck],
];
const labels = {
  id: "ID",
  slug: "Адрес страницы (slug)",
  title: "Заголовок",
  description: "Описание / текст",
  keywords: "Ключевые слова",
  enabled: "Опубликовано",
  logo: "Логотип",
  lion: "Изображение льва",
  image: "Изображение",
  url: "Ссылка",
  mode: "Открывать",
  provider: "Провайдер",
  category: "Категория",
  featured: "На главной странице",
  label: "Надзаголовок",
  button: "Текст кнопки",
  kind: "Тип публикации",
  start: "Дата начала (UTC)",
  end: "Дата окончания (UTC)",
  brand: "Название бренда",
  telegram: "Telegram username без @",
  telegramText: "Сообщение для поддержки",
  loginUrl: "Платформа для входа и игр без отдельной ссылки",
  loginMode: "Открывать вход",
  appUrl: "Ссылка на приложение",
  siteUrl: "Основной домен (https://example.com)",
  indexable: "Разрешить индексацию",
  ogImage: "Изображение для соцсетей",
  defaultLanguage: "Язык по умолчанию",
  sliderSeconds: "Интервал слайдера (секунды)",
  home: "Главная",
  slots: "Слоты",
  promotions: "Акции",
  help: "Поддержка",
  app: "Приложение",
};
export default function Admin() {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false),
    [draft, setDraft] = useState(null),
    [revision, setRevision] = useState(0),
    [dirty, setDirty] = useState(false),
    [section, setSection] = useState("overview"),
    [selected, setSelected] = useState(""),
    [lang, setLang] = useState("ru"),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function api(url, options = {}) {
    const r = await fetch("/api" + url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(user?.csrf ? { "X-CSRF-Token": user.csrf } : {}),
        ...options.headers,
      },
    });
    const d = await r.json();
    if (!r.ok) {
      if (r.status === 401 && url !== "/login") setUser(null);
      throw new Error(d.error || "Ошибка запроса");
    }
    return d;
  }
  async function loadContent(u) {
    if (u.role === "support") return;
    const d = await api("/admin/content");
    setDraft(d.content);
    setRevision(d.revision);
    setDirty(false);
  }
  useEffect(() => {
    api("/session")
      .then((u) => {
        setUser(u);
        return loadContent(u);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    const before = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", before);
    return () => window.removeEventListener("beforeunload", before);
  }, [dirty]);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const u = await api("/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(f)),
      });
      setUser(u);
      await loadContent(u);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const change = (path, value) => {
    setDraft((prev) => {
      const next = structuredClone(prev);
      let ref = next;
      for (const key of path.slice(0, -1)) ref = ref[key];
      ref[path.at(-1)] = value;
      return next;
    });
    setDirty(true);
    setMessage("");
  };
  async function save() {
    setBusy(true);
    setError("");
    try {
      const d = await api("/content", {
        method: "PUT",
        body: JSON.stringify({ content: draft, revision }),
      });
      setRevision(d.revision);
      setDirty(false);
      setMessage("Изменения опубликованы");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function add() {
    const template = structuredClone(initialContent[section][0]);
    // getRandomValues also works on a temporary HTTP demo opened by server IP.
    const suffix = Array.from(
      crypto.getRandomValues(new Uint8Array(8)),
      (byte) => byte.toString(16).padStart(2, "0"),
    ).join("");
    template.id = section + "-" + suffix;
    template.slug = template.id;
    template.title = { ru: "Новая запись", hy: "Նոր գրառում", en: "New item" };
    template.description = { ru: "", hy: "", en: "" };
    template.seo = {
      title: { ru: "", hy: "", en: "" },
      description: { ru: "", hy: "", en: "" },
      keywords: { ru: "", hy: "", en: "" },
    };
    if ("url" in template) template.url = "";
    if ("image" in template) template.image = "";
    if ("logo" in template) template.logo = "";
    if (section === "games") {
      template.provider = draft.providers[0]?.id || "";
      template.category = draft.categories[0]?.id || "";
    }
    template.enabled = false;
    change([section], [...draft[section], template]);
    setSelected(template.id);
  }
  function remove(index) {
    change(
      [section],
      draft[section].filter((_, i) => i !== index),
    );
    setSelected("");
  }
  function reorder(index, delta) {
    const list = [...draft[section]];
    [list[index], list[index + delta]] = [list[index + delta], list[index]];
    change([section], list);
  }
  async function upload(file, path) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      if (file.size > 4 * 1024 * 1024)
        throw new Error("Максимальный размер — 4 МБ");
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const r = await api("/upload", {
        method: "POST",
        body: JSON.stringify({ data }),
      });
      change(path, r.url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const field = (value, path, key) => {
    const label = labels[key] || initialContent.interface.ru[key] || key;
    if (value && typeof value === "object") {
      if ("ru" in value && "hy" in value && "en" in value)
        return (
          <label className="cms-field" key={path.join(".")}>
            <span>
              {label}
              <small>{lang.toUpperCase()}</small>
            </span>
            {["description", "telegramText"].includes(key) ||
            (key === "title" && path[0] === "slides") ? (
              <textarea
                rows={4}
                value={value[lang]}
                onChange={(e) => change([...path, lang], e.target.value)}
              />
            ) : (
              <input
                value={value[lang]}
                onChange={(e) => change([...path, lang], e.target.value)}
              />
            )}
          </label>
        );
      return (
        <details
          className="cms-fieldset"
          key={path.join(".")}
          open={key !== "seo"}
        >
          <summary>{key === "seo" ? "SEO этой страницы" : label}</summary>
          <div>
            {Object.entries(value).map(([k, v]) => field(v, [...path, k], k))}
          </div>
        </details>
      );
    }
    if (typeof value === "boolean")
      return (
        <label className="cms-check" key={path.join(".")}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => change(path, e.target.checked)}
          />
          {label}
        </label>
      );
    if (key === "id")
      return (
        <div className="cms-id" key={path.join(".")}>
          ID: {value}
        </div>
      );
    let options;
    if (key === "provider")
      options = draft.providers.map((x) => [x.id, x.title[lang]]);
    if (key === "category")
      options = draft.categories.map((x) => [x.id, x.title[lang]]);
    if (["mode", "loginMode"].includes(key))
      options = [
        ["iframe", "Встроенное окно (iframe)"],
        ["external", "Новая вкладка"],
      ];
    if (key === "kind")
      options = [
        ["promotion", "Акция"],
        ["bonus", "Бонус"],
        ["news", "Новость"],
        ["offer", "Предложение"],
      ];
    if (key === "defaultLanguage")
      options = [
        ["ru", "Русский"],
        ["hy", "Հայերեն"],
        ["en", "English"],
      ];
    return (
      <label className="cms-field" key={path.join(".")}>
        <span>{label}</span>
        {options ? (
          <select value={value} onChange={(e) => change(path, e.target.value)}>
            {options.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={value}
            type={
              typeof value === "number"
                ? "number"
                : ["start", "end"].includes(key)
                  ? "date"
                  : "text"
            }
            onChange={(e) =>
              change(
                path,
                typeof value === "number"
                  ? Number(e.target.value)
                  : e.target.value,
              )
            }
          />
        )}{" "}
        {["image", "logo", "lion", "ogImage"].includes(key) && (
          <span className="upload-row">
            {value && <img src={value} alt="Предпросмотр" />}
            <span className="upload-control">
              <Upload size={15} /> Загрузить PNG, JPG, WebP
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={busy}
                onChange={(e) => upload(e.target.files[0], path)}
              />
            </span>
          </span>
        )}
        {["url", "loginUrl", "appUrl"].includes(key) && (
          <small>
            Для игры укажите прямой HTTPS-адрес. Пустое поле отключает запуск.
          </small>
        )}
      </label>
    );
  };
  if (!ready) return <div className="cms-loading">Загрузка CMS…</div>;
  if (!user)
    return (
      <div className="cms-login">
        <a href="/ru">
          <img src="/images/wordmark.webp" alt="YvnBet" />
        </a>
        <form onSubmit={login}>
          <span className="eyebrow">CONTENT MANAGEMENT</span>
          <h1>Всё под вашим контролем.</h1>
          <p>Войдите для управления сайтом</p>
          <label>
            Логин
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Пароль
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy ? "Входим…" : "Войти в панель"}
            <ChevronRight size={17} />
          </button>
        </form>
        <small>YvnBet CMS • доступ только для команды</small>
      </div>
    );
  const allowed = groups.filter(
    ([key]) =>
      user.role === "admin" ||
      (user.role === "editor" && !["users", "leads", "audit"].includes(key)) ||
      (user.role === "support" && ["overview", "leads"].includes(key)),
  );
  const list = draft && Array.isArray(draft[section]) ? draft[section] : null;
  const index = list?.findIndex((x) => x.id === selected),
    current = index >= 0 ? list[index] : null;
  return (
    <div className="cms">
      <aside className="cms-sidebar">
        <a className="cms-brand" href="/ru" target="_blank" rel="noreferrer">
          <img src="/images/wordmark.webp" alt="YvnBet" />
          <span>CONTENT STUDIO</span>
        </a>
        <nav>
          {allowed.map(([id, name, Icon]) => (
            <button
              key={id}
              className={section === id ? "active" : ""}
              onClick={() => {
                setSection(id);
                setSelected("");
                setError("");
              }}
            >
              <Icon size={18} />
              {name}
            </button>
          ))}
        </nav>
        <div className="cms-account">
          <span className="avatar">{user.username[0].toUpperCase()}</span>
          <div>
            <strong>{user.username}</strong>
            <small>{user.role}</small>
          </div>
          <button
            aria-label="Выйти"
            onClick={async () => {
              if (
                dirty &&
                !confirm(
                  "Есть неопубликованные изменения. Выйти без сохранения?",
                )
              )
                return;
              await api("/logout", { method: "POST", body: "{}" });
              setUser(null);
              setDirty(false);
            }}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="cms-main">
        <header className="cms-toolbar">
          <div>
            <small>YvnBet / Управление</small>
            <h1>{groups.find((x) => x[0] === section)?.[1]}</h1>
          </div>
          <div>
            <a
              className="cms-secondary"
              href="/ru"
              target="_blank"
              rel="noreferrer"
            >
              Открыть сайт
              <ExternalLink size={15} />
            </a>
            {draft && (
              <button
                className="cms-primary"
                onClick={save}
                disabled={busy || !dirty}
              >
                <Save size={16} />
                {busy ? "Сохраняем…" : dirty ? "Опубликовать" : "Всё сохранено"}
              </button>
            )}
          </div>
        </header>
        {(message || error) && (
          <div
            role={error ? "alert" : "status"}
            className={error ? "cms-alert error" : "cms-alert success"}
          >
            {error || message}
          </div>
        )}
        <div className="cms-content">
          {section === "overview" && (
            <>
              <div className="cms-welcome">
                <span className="eyebrow">ВАШ САЙТ, ВАШИ ПРАВИЛА</span>
                <h2>Добро пожаловать, {user.username}.</h2>
                <p>
                  Обновляйте коллекцию, общайтесь с клиентами и управляйте
                  каждой деталью.
                </p>
              </div>
              {draft && (
                <>
                  <div className="cms-stats">
                    {[
                      ["games", "Игры"],
                      ["providers", "Провайдеры"],
                      ["slides", "Слайды"],
                      ["promotions", "Публикации"],
                    ].map(([key, label]) => (
                      <button key={key} onClick={() => setSection(key)}>
                        <span>{label}</span>
                        <strong>{draft[key].length}</strong>
                        <ArrowUp size={17} />
                      </button>
                    ))}
                  </div>
                  <div className="cms-card">
                    <h3>Перед публикацией</h3>
                    <p>
                      Заполните прямые ссылки на игры и приложение, добавьте
                      реальные акции и тексты оператора. SEO-индексация сейчас{" "}
                      {draft.settings.indexable ? "включена" : "выключена"}.
                    </p>
                    <p>
                      Редактируйте переводы переключателем RU / HY / EN.
                      Изменения вступают в силу после нажатия «Опубликовать».
                    </p>
                    <button
                      className="cms-secondary"
                      onClick={() => setSection("settings")}
                    >
                      Настройки сайта
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </>
              )}
            </>
          )}
          {list && (
            <>
              <div className="cms-section-tools">
                <span>
                  {list.length} записей · порядок на сайте совпадает со списком
                </span>
                <button className="cms-primary" onClick={add}>
                  <Plus size={17} />
                  Добавить
                </button>
              </div>
              <div className="cms-editor-layout">
                <div className="cms-records">
                  {list.map((x, i) => (
                    <div
                      className={
                        "cms-record " + (selected === x.id ? "active" : "")
                      }
                      key={x.id}
                    >
                      <button onClick={() => setSelected(x.id)}>
                        {x.image ? (
                          <img src={x.image} alt="" />
                        ) : (
                          <span className="record-number">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                        )}
                        <span>
                          <strong>{x.title[lang] || x.id}</strong>
                          <small>
                            {x.enabled ? "Опубликовано" : "Черновик"} · /
                            {x.slug}
                          </small>
                        </span>
                      </button>
                      <div className="record-actions">
                        <button
                          aria-label="Выше"
                          disabled={i === 0}
                          onClick={() => reorder(i, -1)}
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          aria-label="Ниже"
                          disabled={i === list.length - 1}
                          onClick={() => reorder(i, 1)}
                        >
                          <ArrowDown size={14} />
                        </button>
                        <button
                          aria-label="Удалить запись"
                          onClick={() => remove(i)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {!list.length && <p>Пока нет записей. Добавьте первую.</p>}
                </div>
                <div className="cms-card cms-editor">
                  {current ? (
                    <>
                      <div className="editor-head">
                        <h2>{current.title[lang]}</h2>
                        <Language value={lang} onChange={setLang} />
                      </div>
                      {section === "slides" && (
                        <p className="cms-banner-help">
                          Загрузите готовый рекламный баннер с текстом внутри
                          изображения. Рекомендуемый размер — 1600 × 900 px; все
                          баннеры лучше делать одного формата. Картинка
                          показывается целиком. Заголовок и описание
                          используются для доступности, ссылка открывается по
                          нажатию на баннер.
                        </p>
                      )}
                      {Object.entries(current)
                        .filter(
                          ([k]) =>
                            section !== "slides" ||
                            !["label", "button"].includes(k),
                        )
                        .map(([k, v]) => field(v, [section, index, k], k))}
                    </>
                  ) : (
                    <div className="cms-placeholder">
                      <FileText size={36} />
                      <h3>Выберите запись</h3>
                      <p>Или добавьте новую с помощью кнопки выше.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {draft && ["settings", "seo", "interface"].includes(section) && (
            <div className="cms-card">
              <div className="editor-head">
                <h2>
                  {section === "seo"
                    ? "Поисковое представление"
                    : section === "interface"
                      ? "Переводы интерфейса"
                      : "Общие настройки"}
                </h2>
                <Language value={lang} onChange={setLang} />
              </div>
              {section === "seo" && (
                <p>
                  Пустые поля используют заголовок и описание страницы. SEO игр,
                  провайдеров и публикаций находится внутри соответствующих
                  записей.
                </p>
              )}
              {section === "interface"
                ? Object.entries(draft.interface[lang]).map(([k, v]) =>
                    field(v, ["interface", lang, k], k),
                  )
                : Object.entries(draft[section]).map(([k, v]) =>
                    field(v, [section, k], k),
                  )}
            </div>
          )}
          {section === "leads" && (
            <Leads api={api} admin={user.role === "admin"} onError={setError} />
          )}
          {section === "users" && (
            <Team api={api} self={user.id} onError={setError} />
          )}
          {section === "audit" && <Audit api={api} onError={setError} />}
        </div>
      </div>
    </div>
  );
}
function Language({ value, onChange }) {
  return (
    <div className="cms-languages">
      {["ru", "hy", "en"].map((l) => (
        <button
          key={l}
          className={value === l ? "active" : ""}
          onClick={() => onChange(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
function Leads({ api, admin, onError }) {
  const [data, setData] = useState({ items: [], total: 0 }),
    [offset, setOffset] = useState(0);
  const load = () =>
    api("/leads?offset=" + offset)
      .then(setData)
      .catch((e) => onError(e.message));
  useEffect(() => {
    load();
  }, [offset]);
  return (
    <div className="cms-card">
      <div className="editor-head">
        <h2>
          Регистрационные заявки <small>{data.total}</small>
        </h2>
        <button className="cms-secondary" onClick={load}>
          Обновить
        </button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Дата / имя</th>
              <th>Контакты</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.items.map((x) => (
              <tr key={x.id}>
                <td>
                  <small>{new Date(x.created).toLocaleString("ru")}</small>
                  <strong>{x.name}</strong>
                </td>
                <td>
                  <span>{x.phone}</span>
                  {x.telegram && <span>{x.telegram}</span>}
                  {x.city && <span>{x.city}</span>}
                  {x.adult && <small>18+ подтверждено</small>}
                  <small>{x.language.toUpperCase()} · согласие получено</small>
                </td>
                <td>
                  <select
                    aria-label="Статус заявки"
                    value={x.status}
                    onChange={async (e) => {
                      try {
                        await api("/leads/" + x.id, {
                          method: "PATCH",
                          body: JSON.stringify({ status: e.target.value }),
                        });
                        load();
                      } catch (e) {
                        onError(e.message);
                      }
                    }}
                  >
                    <option value="new">Новая</option>
                    <option value="contacted">Связались</option>
                    <option value="closed">Закрыта</option>
                  </select>
                </td>
                <td>
                  {admin && (
                    <button
                      className="cms-danger"
                      onClick={async () => {
                        if (
                          confirm(
                            "Безвозвратно удалить персональные данные этой заявки?",
                          )
                        )
                          try {
                            await api("/leads/" + x.id, {
                              method: "DELETE",
                              body: "{}",
                            });
                            load();
                          } catch (e) {
                            onError(e.message);
                          }
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!data.total && (
        <div className="cms-placeholder">
          <Inbox size={36} />
          <p>Новые заявки появятся здесь.</p>
        </div>
      )}
      <div className="cms-section-tools">
        <button
          className="cms-secondary"
          disabled={!offset}
          onClick={() => setOffset(offset - 50)}
        >
          Назад
        </button>
        <span>
          {offset + 1}–{Math.min(offset + 50, data.total)} / {data.total}
        </span>
        <button
          className="cms-secondary"
          disabled={offset + 50 >= data.total}
          onClick={() => setOffset(offset + 50)}
        >
          Далее
        </button>
      </div>
    </div>
  );
}
function Team({ api, self, onError }) {
  const [users, setUsers] = useState([]),
    [editing, setEditing] = useState(null),
    [notice, setNotice] = useState("");
  const load = () =>
    api("/users")
      .then(setUsers)
      .catch((e) => onError(e.message));
  useEffect(() => {
    load();
  }, []);
  async function save(e) {
    e.preventDefault();
    const f = e.currentTarget;
    const body = Object.fromEntries(new FormData(f));
    try {
      await api(editing ? "/users/" + editing.id : "/users", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(body),
      });
      f.reset();
      setEditing(null);
      setNotice(
        "Доступ обновлён. При изменении роли или пароля сессии пользователя завершены.",
      );
      load();
    } catch (e) {
      onError(e.message);
    }
  }
  return (
    <div className="cms-team">
      <div className="cms-card">
        <h2>Команда</h2>
        <p>
          Администратор — полный доступ. Редактор — контент. Поддержка — заявки.
        </p>
        {users.map((u) => (
          <div className="team-row" key={u.id}>
            <span className="avatar">{u.username[0].toUpperCase()}</span>
            <div>
              <strong>{u.username}</strong>
              <small>{u.role}</small>
            </div>
            <button className="cms-secondary" onClick={() => setEditing(u)}>
              Изменить
            </button>
            {u.id !== self && (
              <button
                className="cms-danger"
                aria-label="Удалить пользователя"
                onClick={async () => {
                  if (confirm("Удалить доступ " + u.username + "?"))
                    try {
                      await api("/users/" + u.id, {
                        method: "DELETE",
                        body: "{}",
                      });
                      load();
                    } catch (e) {
                      onError(e.message);
                    }
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      <form className="cms-card" onSubmit={save} key={editing?.id || "new"}>
        <h2>
          {editing ? "Изменить " + editing.username : "Добавить участника"}
        </h2>
        {!editing && (
          <label className="cms-field">
            Логин
            <input
              name="username"
              pattern="[A-Za-z0-9_-]{3,40}"
              required
              autoComplete="off"
            />
          </label>
        )}
        <label className="cms-field">
          {editing
            ? "Новый пароль (необязательно)"
            : "Пароль, минимум 12 символов"}
          <input
            type="password"
            name="password"
            minLength={12}
            maxLength={256}
            required={!editing}
            autoComplete="new-password"
          />
        </label>
        <label className="cms-field">
          Роль
          <select name="role" defaultValue={editing?.role || "editor"}>
            <option value="editor">Редактор</option>
            <option value="support">Поддержка</option>
            <option value="admin">Администратор</option>
          </select>
        </label>
        <button className="cms-primary">
          {editing ? "Сохранить" : "Создать"}
        </button>
        {editing && (
          <button
            type="button"
            className="cms-secondary"
            onClick={() => setEditing(null)}
          >
            Отмена
          </button>
        )}
        {notice && <p role="status">{notice}</p>}
      </form>
    </div>
  );
}
function Audit({ api, onError }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api("/audit")
      .then(setItems)
      .catch((e) => onError(e.message));
  }, []);
  return (
    <div className="cms-card">
      <h2>Последние 100 действий</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Дата</th>
              <th>Пользователь</th>
              <th>Действие</th>
            </tr>
          </thead>
          <tbody>
            {items.map((x) => (
              <tr key={x.id}>
                <td>{new Date(x.created).toLocaleString("ru")}</td>
                <td>{x.actor}</td>
                <td>{x.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
