import React, { useEffect, useRef, useState } from "react";
import {
  Home,
  Gamepad2,
  Gift,
  Headphones,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Play,
  Pause,
  Shuffle,
  Smartphone,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import Modal from "./components/Modal.jsx";
import { routeFor } from "./routes.mjs";
const icons = {
  home: Home,
  slots: Gamepad2,
  promotions: Gift,
  help: Headphones,
};
export default function Site({ content: c, path }) {
  const route = routeFor(path, c),
    { lang, section, item, valid } = route,
    t = c.interface[lang],
    L = (v) => v?.[lang] || "",
    href = (s) => `/${lang}${s === "home" ? "" : "/" + s}`;
  const [modal, setModal] = useState(null),
    [age, setAge] = useState(true),
    [denied, setDenied] = useState(false);
  const gamePage = valid && section === "games" && item;
  const platformPage = gamePage || (valid && section === "login");
  const frame = platformPage
    ? {
        url:
          item?.url ||
          c.providers.find((p) => p.id === item?.provider)?.url ||
          c.settings.loginUrl,
        title: gamePage ? L(item.title) : t.login,
      }
    : modal?.type === "frame"
      ? modal
      : null;
  useEffect(() => {
    try {
      setAge(localStorage.getItem("yvn-age") !== "18");
    } catch {}
  }, []);
  const accept = () => {
    try {
      localStorage.setItem("yvn-age", "18");
    } catch {}
    setAge(false);
  };
  const launch = (url, mode, title) => {
    if (!url) return;
    if (mode === "external") window.open(url, "_blank", "noopener,noreferrer");
    else setModal({ type: "frame", url, title });
  };
  const telegram = `https://t.me/${c.settings.telegram}?text=${encodeURIComponent(L(c.settings.telegramText))}`;
  const nav = (where) => (
    <nav
      className={where}
      aria-label={
        where === "bottom-nav" ? "Mobile navigation" : "Main navigation"
      }
    >
      {Object.entries(icons).map(([key, Icon]) => (
        <a
          key={key}
          href={href(key)}
          aria-current={section === key ? "page" : undefined}
        >
          <Icon size={21} />
          <span>{t[key]}</span>
        </a>
      ))}
    </nav>
  );
  const localizedUrl = (url) =>
    url.startsWith("/") && !/^\/(ru|hy|en)(\/|$)/.test(url)
      ? `/${lang}${url}`
      : url;
  const card = (g) => (
    <a className="game-card" key={g.id} href={href("games/" + g.slug)}>
      <div className="game-art">
        <img
          src={g.image}
          alt={L(g.title)}
          width="600"
          height="440"
          loading="lazy"
        />
        <span className="game-play">
          <Play size={25} fill="currentColor" />
        </span>
      </div>
      <div className="game-meta">
        <h3>{L(g.title)}</h3>
        <p>{L(c.providers.find((p) => p.id === g.provider)?.title)}</p>
        <ArrowUpRight size={17} />
      </div>
    </a>
  );
  const offers = (list) => (
    <div className="promotion-grid">
      {list.map((p) => (
        <a
          className="promotion-card"
          key={p.id}
          href={href("promotions/" + p.slug)}
        >
          <img src={p.image} alt="" loading="lazy" width="600" height="360" />
          <div>
            <span className="eyebrow">{t[p.kind]}</span>
            <h3>{L(p.title)}</h3>
            <p>{L(p.description)}</p>
            <span className="text-link">
              {t.details}
              <ArrowUpRight size={16} />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
  return (
    <>
      <a className="skip" href="#main">
        {t.catalog}
      </a>
      <div
        className={"public-site" + (frame ? " platform-view" : "")}
        inert={age ? true : undefined}
      >
        <header className="header">
          <a
            className="brand"
            href={href("home")}
            aria-label={c.settings.brand}
          >
            <img src={c.settings.logo} alt={c.settings.brand} />
          </a>
          {!frame && nav("header-nav")}
          <div className="header-actions">
            <LanguageMenu lang={lang} path={route.path} />
            {frame ? (
              <>
                {platformPage ? (
                  <a className="button quiet" href={href("slots")}>
                    {t.back}
                  </a>
                ) : (
                  <button
                    className="button quiet"
                    onClick={() => setModal(null)}
                  >
                    {t.back}
                  </button>
                )}
                {frame.url && (
                  <a
                    className="icon-button"
                    href={frame.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t.external}
                    title={t.external}
                  >
                    <ArrowUpRight size={18} />
                  </a>
                )}
              </>
            ) : (
              <a className="button quiet" href={href("login")}>
                {t.login}
              </a>
            )}
          </div>
        </header>
        {frame ? (
          <main id="main" className="platform-main">
            {frame.url ? (
              <iframe
                title={frame.title}
                src={age ? undefined : frame.url}
                referrerPolicy="strict-origin-when-cross-origin"
                sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                allow="fullscreen"
              />
            ) : (
              <p className="notice">{t.unavailable}</p>
            )}
          </main>
        ) : (
          <>
            <div className="site-body">
              <main id="main">
                {!valid ? (
                  <section className="page-heading">
                    <p className="eyebrow">404</p>
                    <h1>{t.notFound}</h1>
                    <a className="button" href={href("home")}>
                      {t.home}
                    </a>
                  </section>
                ) : (
                  <>
                    {section === "home" && (
                      <>
                        {!c.slides.length && (
                          <section className="page-heading">
                            <h1>{t.collection}</h1>
                          </section>
                        )}
                        <Slider
                          slides={c.slides}
                          L={L}
                          t={t}
                          seconds={c.settings.sliderSeconds}
                          localizedUrl={localizedUrl}
                        />
                        <div className="hero-actions">
                          <button
                            className="button"
                            onClick={() => setModal({ type: "register" })}
                          >
                            {t.register}
                            <ArrowUpRight size={18} />
                          </button>
                          <a className="button quiet" href={href("login")}>
                            {t.login}
                          </a>
                        </div>
                        <ProviderRail
                          providers={c.providers}
                          L={L}
                          t={t}
                          href={href}
                        />
                        <section className="section">
                          <div className="section-heading">
                            <div>
                              <span className="eyebrow">{t.catalog}</span>
                              <h2>
                                {t.featured}
                                <span className="count">{c.games.length}</span>
                              </h2>
                            </div>
                            <a className="text-link" href={href("slots")}>
                              {t.more}
                              <ArrowRight size={17} />
                            </a>
                          </div>
                          <div className="game-grid">
                            {c.games
                              .filter((g) => g.featured)
                              .slice(0, 6)
                              .map(card)}
                          </div>
                        </section>
                        <Random c={c} t={t} L={L} card={card} />
                        {c.promotions.length > 0 && (
                          <section className="section">
                            <div className="section-heading">
                              <h2>{t.offers}</h2>
                              <a
                                className="text-link"
                                href={href("promotions")}
                              >
                                {t.more}
                                <ArrowRight size={17} />
                              </a>
                            </div>
                            {offers(c.promotions.slice(0, 3))}
                          </section>
                        )}
                      </>
                    )}
                    {(section === "slots" || section === "providers") && (
                      <>
                        <section className="page-heading">
                          <span className="eyebrow">{t.catalog}</span>
                          <h1>{item ? L(item.title) : t.collection}</h1>
                          {item && <p>{L(item.description)}</p>}
                        </section>
                        <Catalog
                          c={c}
                          t={t}
                          L={L}
                          provider={item?.id}
                          card={card}
                        />
                        {item?.url && (
                          <button
                            className="button"
                            onClick={() =>
                              launch(item.url, item.mode, L(item.title))
                            }
                          >
                            {t.play}
                            <ArrowUpRight size={17} />
                          </button>
                        )}
                      </>
                    )}
                    {section === "promotions" && !item && (
                      <>
                        <section className="page-heading">
                          <span className="eyebrow">{t.promotions}</span>
                          <h1>{t.offers}</h1>
                        </section>
                        {offers(c.promotions)}
                        {!c.promotions.length && (
                          <p className="empty">{t.empty}</p>
                        )}
                      </>
                    )}
                    {section === "promotions" && item && (
                      <article className="detail">
                        <img className="detail-art" src={item.image} alt="" />
                        <div>
                          <span className="eyebrow">{t[item.kind]}</span>
                          <h1>{L(item.title)}</h1>
                          {(item.start || item.end) && (
                            <small>
                              {item.start} — {item.end}
                            </small>
                          )}
                          <p className="prose">{L(item.description)}</p>
                          {item.url && (
                            <a className="button" href={localizedUrl(item.url)}>
                              {L(item.button)}
                              <ArrowUpRight size={17} />
                            </a>
                          )}
                        </div>
                      </article>
                    )}
                    {section === "help" && (
                      <section className="help-layout">
                        <div className="page-heading">
                          <span className="eyebrow">{t.help}</span>
                          <h1>{t.questions}</h1>
                          <a
                            className="button"
                            href={telegram}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <TelegramIcon size={18} />
                            {t.telegram}
                          </a>
                        </div>
                        <div className="faq-list">
                          {c.faq.map((q, i) => (
                            <details key={q.id}>
                              <summary>
                                <span className="faq-number">0{i + 1}</span>
                                {L(q.title)}
                                <span>+</span>
                              </summary>
                              <p>{L(q.description)}</p>
                            </details>
                          ))}
                        </div>
                      </section>
                    )}
                    {c.pages.includes(item) && section !== "app" && item && (
                      <article className="text-page">
                        <span className="eyebrow">{c.settings.brand}</span>
                        <h1>{L(item.title)}</h1>
                        <p className="prose">{L(item.description)}</p>
                      </article>
                    )}
                    {section === "app" && item && (
                      <section className="app-page">
                        <div className="app-symbol">
                          <Smartphone size={130} />
                          <img src={c.settings.lion} alt="" />
                        </div>
                        <div>
                          <span className="eyebrow">{t.app}</span>
                          <h1>{L(item.title)}</h1>
                          <p>{L(item.description)}</p>
                          {c.settings.appUrl ? (
                            <a
                              className="button"
                              href={c.settings.appUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t.download}
                              <ArrowUpRight size={18} />
                            </a>
                          ) : (
                            <p className="notice">{t.soon}</p>
                          )}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </main>
              <footer>
                {nav("footer-nav")}
                <div className="footer-top">
                  <a className="brand" href={href("home")}>
                    <img src={c.settings.logo} alt={c.settings.brand} />
                  </a>
                  <div className="footer-links">
                    {["about", "privacy", "terms", "help", "app"].map((k) => (
                      <a href={href(k)} key={k}>
                        {t[k]}
                      </a>
                    ))}
                  </div>
                  <span className="age-seal">18+</span>
                </div>
                <div className="footer-bottom">
                  <span>
                    © {new Date().getFullYear()} {c.settings.brand}. {t.rights}
                  </span>
                  <span>{t.responsible}</span>
                </div>
              </footer>
            </div>
            {nav("bottom-nav")}
            <a
              className="telegram-float"
              href={telegram}
              target="_blank"
              rel="noreferrer"
              aria-label={t.telegram}
            >
              <TelegramIcon size={30} />
              <span className="online-dot" />
            </a>
          </>
        )}
      </div>
      {age && (
        <Modal title={denied ? "18+" : t.age}>
          <div className="age-content">
            <img src={c.settings.lion} alt="" />
            <p>{denied ? t.denied : t.ageText}</p>
            {denied ? (
              <button className="button quiet" onClick={() => setDenied(false)}>
                {t.back}
              </button>
            ) : (
              <>
                <button className="button" onClick={accept}>
                  {t.yes}
                  <ArrowRight size={18} />
                </button>
                <button className="text-button" onClick={() => setDenied(true)}>
                  {t.no}
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
      {!age && modal?.type === "register" && (
        <Registration c={c} lang={lang} t={t} onClose={() => setModal(null)} />
      )}
    </>
  );
}
function Slider({ slides, L, t, seconds, localizedUrl }) {
  const [index, setIndex] = useState(0),
    [paused, setPaused] = useState(false),
    [hover, setHover] = useState(false);
  useEffect(() => {
    if (
      paused ||
      hover ||
      slides.length < 2 ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % slides.length);
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [paused, hover, seconds, slides.length]);
  if (!slides.length) return null;
  const s = slides[index % slides.length];
  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={t.offers}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocusCapture={() => setHover(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setHover(false);
      }}
    >
      <img className="hero-art" src={s.image} alt="" fetchPriority="high" />
      <div className="hero-overlay" />
      <div className="hero-copy" key={s.id}>
        <span className="eyebrow">
          <span className="gold-dot" />
          {L(s.label)}
        </span>
        <h1>{L(s.title)}</h1>
        <p>{L(s.description)}</p>
        {s.url && (
          <a className="button hero-cta" href={localizedUrl(s.url)}>
            {L(s.button)}
            <ArrowUpRight size={18} />
          </a>
        )}
      </div>
      <div className="hero-controls">
        <div className="slide-dots">
          {slides.map((s, i) => (
            <button
              key={s.id}
              aria-label={`${t.slide} ${i + 1}`}
              aria-current={i === index ? "true" : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
        <span className="slide-counter">
          0{index + 1} <span>/ 0{slides.length}</span>
        </span>
        <button
          className="icon-button"
          aria-label={t.prev}
          onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="icon-button"
          aria-label={t.next}
          onClick={() => setIndex((index + 1) % slides.length)}
        >
          <ChevronRight size={18} />
        </button>
        <button
          className="icon-button"
          aria-label={paused ? t.resume : t.pause}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
      </div>
    </section>
  );
}
function Catalog({ c, t, L, provider, card }) {
  const [filter, setFilter] = useState(provider || ""),
    [search, setSearch] = useState("");
  const games = c.games.filter(
    (g) =>
      (!filter || g.provider === filter) &&
      L(g.title).toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );
  return (
    <section className="catalog">
      <div className="catalog-controls">
        <span className="catalog-label">
          {t.slots}
          <span className="count">{games.length}</span>
        </span>
        <label className="search">
          <Search size={18} />
          <input
            aria-label={t.search}
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>
      {!provider && (
        <ProviderRail
          providers={c.providers}
          L={L}
          t={t}
          selected={filter}
          onSelect={setFilter}
        />
      )}
      <div className="game-grid">{games.map(card)}</div>
      {!games.length && <p className="empty">{t.empty}</p>}
    </section>
  );
}
function Random({ c, t, L, card }) {
  const [busy, setBusy] = useState(false),
    [result, setResult] = useState([]),
    timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const spin = () => {
    if (busy || !c.games.length) return;
    setBusy(true);
    timer.current = setTimeout(
      () => {
        const pool = [...c.games],
          selected = [];
        while (pool.length && selected.length < 3) {
          const n = new Uint32Array(1);
          crypto.getRandomValues(n);
          selected.push(
            pool.splice(Math.floor((n[0] / 4294967296) * pool.length), 1)[0],
          );
        }
        setResult(selected);
        setBusy(false);
      },
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 10 : 1600,
    );
  };
  return (
    <section className="random-section">
      <div className="random-main">
        <div>
          <span className="eyebrow">
            <Sparkles size={14} /> {t.selection}
          </span>
          <h2>{t.random}</h2>
          <p>{t.randomText}</p>
          <button
            className="button gold"
            disabled={busy || !c.games.length}
            onClick={spin}
          >
            <Shuffle size={18} />
            {busy ? t.spinning : result.length ? t.again : t.spin}
          </button>
        </div>
        <div className={"lion-orbit " + (busy ? "spinning" : "")}>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <span className="orbit-star one">✦</span>
          <span className="orbit-star two">✦</span>
          <button
            className="lion-button"
            aria-label={t.spin}
            onClick={spin}
            disabled={busy || !c.games.length}
          >
            <img src={c.settings.lion} alt="" />
          </button>
          <span className="orbit-caption">YVNBET</span>
        </div>
      </div>
      <div aria-live="polite">
        {result.length > 0 && !busy && (
          <div className="random-results">
            <h3>{t.selection}</h3>
            <div className="game-grid">{result.map(card)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
function Registration({ c, lang, t, onClose }) {
  const [state, setState] = useState(""),
    [error, setError] = useState(""),
    [url, setUrl] = useState("");
  async function submit(e) {
    e.preventDefault();
    setState("pending");
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          city: f.get("city"),
          adult: f.get("adult") === "on",
          telegram: f.get("telegram"),
          website: f.get("website"),
          consent: f.get("consent") === "on",
          language: lang,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(t.error);
      setUrl(data.telegramUrl);
      setState("saved");
      window.location.assign(data.telegramUrl);
    } catch {
      setError(t.error);
      setState("");
    }
  }
  return (
    <Modal
      title={state === "saved" ? t.saved : t.register}
      onClose={onClose}
      closeLabel={t.close}
    >
      {state === "saved" ? (
        <div className="registration-success">
          <CheckCircle2 size={42} />
          <p>{t.sendHint}</p>
          <a className="button" href={url}>
            {t.telegram}
            <TelegramIcon size={18} />
          </a>
        </div>
      ) : (
        <form className="registration-form" onSubmit={submit}>
          <label>
            {t.name}
            <input
              name="name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
            />
          </label>
          <label>
            {t.phone}
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              minLength={7}
              maxLength={25}
              placeholder="+374 …"
            />
          </label>
          <label>
            {t.city}
            <input
              name="city"
              autoComplete="address-level2"
              required
              minLength={2}
              maxLength={100}
            />
          </label>
          <label>
            {t.handle} <small>{t.optional}</small>
            <input
              name="telegram"
              pattern="@?[A-Za-z][A-Za-z0-9_]{4,31}"
              placeholder="@username"
              autoComplete="off"
            />
          </label>
          <label className="honeypot" aria-hidden="true">
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
          <label className="check">
            <input name="adult" type="checkbox" required />
            <span>{t.adultConfirmation}</span>
          </label>
          <label className="check">
            <input name="consent" type="checkbox" required />
            <span>
              {t.consent}{" "}
              <a href={`/${lang}/privacy`} target="_blank" rel="noreferrer">
                ↗
              </a>
            </span>
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button className="button" disabled={state === "pending"}>
            {state === "pending" ? t.pending : t.submit}
            <TelegramIcon size={17} />
          </button>
        </form>
      )}
    </Modal>
  );
}

function TelegramIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M21.5 3.4 2.6 10.7c-.9.4-.9 1.2 0 1.5l4.8 1.5 1.8 5.7c.2.7.7.9 1.2.3l2.7-2.9 4.9 3.6c.8.6 1.5.3 1.7-.7l3.2-15c.2-1.1-.4-1.6-1.4-1.3ZM9.2 13.3l9.7-7-7.6 8.5-.3 2.7-1.8-4.2Z" />
    </svg>
  );
}
function ProviderRail({ providers, L, t, href, selected, onSelect }) {
  const ref = useRef(null),
    drag = useRef(null),
    moved = useRef(false);
  const scroll = (direction) =>
    ref.current?.scrollBy({
      left: direction * 250,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <div className="provider-rail-wrap">
      <button
        className="icon-button"
        aria-label={t.previousProviders}
        onClick={() => scroll(-1)}
      >
        <ChevronLeft size={18} />
      </button>
      <div
        className="provider-rail"
        ref={ref}
        aria-label={t.providers}
        onPointerDown={(e) => {
          moved.current = false;
          if (e.pointerType === "mouse" && e.button === 0)
            drag.current = { x: e.clientX, scroll: e.currentTarget.scrollLeft };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          const dx = e.clientX - drag.current.x;
          if (Math.abs(dx) > 5) {
            moved.current = true;
            e.currentTarget.scrollLeft = drag.current.scroll - dx;
          }
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onPointerLeave={() => {
          drag.current = null;
        }}
        onClickCapture={(e) => {
          if (moved.current) {
            e.preventDefault();
            e.stopPropagation();
            moved.current = false;
          }
        }}
      >
        {onSelect && (
          <button
            className={"provider-all " + (!selected ? "active" : "")}
            aria-pressed={!selected}
            onClick={() => onSelect("")}
          >
            {t.all}
          </button>
        )}
        {providers.map((p) => {
          const label = L(p.title);
          const logo = p.logo ? (
            <img src={p.logo} alt={label} loading="lazy" draggable="false" />
          ) : (
            <span className="provider-wordmark">{label}</span>
          );
          return onSelect ? (
            <button
              key={p.id}
              className={"provider-logo " + (selected === p.id ? "active" : "")}
              title={label}
              aria-label={label}
              aria-pressed={selected === p.id}
              onClick={() => onSelect(p.id)}
            >
              {logo}
            </button>
          ) : (
            <a
              key={p.id}
              className="provider-logo"
              href={href("providers/" + p.slug)}
              title={label}
              aria-label={label}
              draggable="false"
            >
              {logo}
            </a>
          );
        })}
      </div>
      <button
        className="icon-button"
        aria-label={t.nextProviders}
        onClick={() => scroll(1)}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

function Flag({ lang }) {
  return (
    <svg className="language-flag" viewBox="0 0 30 30" aria-hidden="true">
      {lang === "en" ? (
        <>
          <path fill="#21468b" d="M0 0h30v30H0z" />
          <path stroke="#fff" strokeWidth="7" d="m0 0 30 30M30 0 0 30" />
          <path stroke="#ce263c" strokeWidth="3" d="m0 0 30 30M30 0 0 30" />
          <path stroke="#fff" strokeWidth="11" d="M15 0v30M0 15h30" />
          <path stroke="#ce263c" strokeWidth="6" d="M15 0v30M0 15h30" />
        </>
      ) : (
        <>
          <path fill={lang === "hy" ? "#d90012" : "#fff"} d="M0 0h30v10H0z" />
          <path
            fill={lang === "hy" ? "#0033a0" : "#1846ba"}
            d="M0 10h30v10H0z"
          />
          <path
            fill={lang === "hy" ? "#f2a800" : "#d52b30"}
            d="M0 20h30v10H0z"
          />
        </>
      )}
    </svg>
  );
}
function LanguageMenu({ lang, path }) {
  const names = { ru: "Русский", hy: "Հայերեն", en: "English" };
  const ref = useRef(null);
  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target))
        ref.current?.removeAttribute("open");
    };
    const escape = (e) => {
      if (e.key === "Escape" && ref.current?.open) {
        ref.current.removeAttribute("open");
        ref.current.querySelector("summary").focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <details className="language-menu" ref={ref}>
      <summary aria-label={names[lang]}>
        <Flag lang={lang} />
        <span>{lang.toUpperCase()}</span>
        <ChevronRight size={12} />
      </summary>
      <nav className="language-options" aria-label="Language">
        {Object.entries(names).map(([code, name]) => (
          <a
            key={code}
            href={path.replace(/^\/(ru|hy|en)/, "/" + code)}
            lang={code}
            hrefLang={code}
            aria-current={code === lang ? "true" : undefined}
          >
            <Flag lang={code} />
            <span>{name}</span>
          </a>
        ))}
      </nav>
    </details>
  );
}
