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
  Send,
  Play,
  Pause,
  Shuffle,
  Smartphone,
  ShieldCheck,
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
        {!g.url && <span className="preview-badge">{t.demo}</span>}
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
      <div className="public-site" inert={age ? true : undefined}>
        <header className="header">
          <a
            className="brand"
            href={href("home")}
            aria-label={c.settings.brand}
          >
            <img src={c.settings.logo} alt={c.settings.brand} />
          </a>
          <div className="header-note">
            <span /> {t.catalog}
          </div>
          <div className="header-actions">
            <select
              aria-label="Language"
              value={lang}
              onChange={(e) =>
                location.assign(
                  route.path.replace(/^\/(ru|hy|en)/, "/" + e.target.value),
                )
              }
            >
              <option value="ru">RU</option>
              <option value="hy">HY</option>
              <option value="en">EN</option>
            </select>
            <button
              className="button quiet"
              disabled={!c.settings.loginUrl}
              onClick={() =>
                launch(c.settings.loginUrl, c.settings.loginMode, t.login)
              }
            >
              {t.login}
            </button>
            <button
              className="button"
              onClick={() => setModal({ type: "register" })}
            >
              {t.register}
              <ArrowUpRight size={16} />
            </button>
          </div>
        </header>
        {nav("side-nav")}
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
                    <div className="quick-strip">
                      <span>
                        <ShieldCheck size={18} />
                        {t.responsible}
                      </span>
                      <a href={telegram} target="_blank" rel="noreferrer">
                        {t.help}
                        <ArrowUpRight size={16} />
                      </a>
                    </div>
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
                    <section className="section">
                      <div className="section-heading">
                        <div>
                          <span className="eyebrow">{t.providers}</span>
                          <h2>{t.providers}</h2>
                        </div>
                      </div>
                      <div className="provider-grid">
                        {c.providers.map((p) => (
                          <a href={href("providers/" + p.slug)} key={p.id}>
                            {p.logo ? (
                              <img
                                src={p.logo}
                                alt={L(p.title)}
                                loading="lazy"
                              />
                            ) : (
                              <strong>{L(p.title)}</strong>
                            )}
                            <ArrowUpRight size={16} />
                          </a>
                        ))}
                      </div>
                    </section>
                    {c.promotions.length > 0 && (
                      <section className="section">
                        <div className="section-heading">
                          <h2>{t.offers}</h2>
                          <a className="text-link" href={href("promotions")}>
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
                    {!c.promotions.length && <p className="empty">{t.empty}</p>}
                  </>
                )}
                {section === "games" && item && (
                  <section className="detail">
                    <img
                      className="detail-art"
                      src={item.image}
                      alt={L(item.title)}
                    />
                    <div>
                      <a
                        className="eyebrow"
                        href={href(
                          "providers/" +
                            c.providers.find((p) => p.id === item.provider)
                              ?.slug,
                        )}
                      >
                        {L(
                          c.providers.find((p) => p.id === item.provider)
                            ?.title,
                        )}
                      </a>
                      <h1>{L(item.title)}</h1>
                      <p>{L(item.description)}</p>
                      {item.url ? (
                        <button
                          className="button"
                          onClick={() =>
                            launch(item.url, item.mode, L(item.title))
                          }
                        >
                          <Play size={19} />
                          {t.play}
                        </button>
                      ) : (
                        <div className="notice">{t.unavailable}</div>
                      )}
                      <a className="text-link" href={href("slots")}>
                        {t.all}
                        <ArrowRight size={17} />
                      </a>
                    </div>
                  </section>
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
                        <Send size={18} />
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
          <Send size={26} />
          <span className="online-dot" />
        </a>
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
      {!age && modal?.type === "frame" && (
        <Modal
          title={modal.title}
          onClose={() => setModal(null)}
          closeLabel={t.close}
          wide
        >
          <div className="frame-tools">
            <p>{t.frameHelp}</p>
            <a
              className="button quiet"
              href={modal.url}
              target="_blank"
              rel="noreferrer"
            >
              {t.external}
              <ArrowUpRight size={16} />
            </a>
          </div>
          <iframe
            title={modal.title}
            src={modal.url}
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            allow="fullscreen"
          />
        </Modal>
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
    [category, setCategory] = useState(""),
    [search, setSearch] = useState("");
  const games = c.games.filter(
    (g) =>
      (!filter || g.provider === filter) &&
      (!category || g.category === category) &&
      L(g.title).toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  );
  return (
    <section className="catalog">
      <div className="catalog-controls">
        <div className="filter-chips">
          <button
            className={!category ? "active" : ""}
            onClick={() => setCategory("")}
          >
            {t.all}
          </button>
          {c.categories.map((x) => (
            <button
              key={x.id}
              className={category === x.id ? "active" : ""}
              onClick={() => setCategory(x.id)}
            >
              {L(x.title)}
            </button>
          ))}
        </div>
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
        <div className="provider-chips">
          <button
            className={!filter ? "active" : ""}
            onClick={() => setFilter("")}
          >
            {t.providers}
          </button>
          {c.providers.map((p) => (
            <button
              key={p.id}
              className={filter === p.id ? "active" : ""}
              onClick={() => setFilter(p.id)}
            >
              {p.logo && <img src={p.logo} alt="" />}
              {L(p.title)}
            </button>
          ))}
        </div>
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
            <Send size={18} />
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
            {t.handle}
            <input
              name="telegram"
              required
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
            <Send size={17} />
          </button>
        </form>
      )}
    </Modal>
  );
}
