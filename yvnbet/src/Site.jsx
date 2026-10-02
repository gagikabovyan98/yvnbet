import useEmblaCarousel from "embla-carousel-react";
import React, { useEffect, useRef, useState } from "react";
import {
  Home,
  Gift,
  Headphones,
  ArrowUpRight,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Play,
  Smartphone,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { createReel } from "./reel.mjs";
import PhoneInput from "./components/PhoneInput.jsx";
import { normalizePhone } from "./phone.mjs";
import { telegramContact } from "./content.mjs";
import Modal from "./components/Modal.jsx";
import { routeFor } from "./routes.mjs";
const icons = {
  home: Home,
  slots: SlotsIcon,
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
  const telegram = telegramContact(
    c.settings,
    "support",
    L(c.settings.telegramText),
  );
  if (c.settings.maintenance) return (
    <main className="maintenance-page">
      <img className="maintenance-brand" src={c.settings.logo} alt={c.settings.brand} />
      <img className="maintenance-lion" src={c.settings.lion} alt="" />
      <h1>{L(c.settings.maintenanceTitle)}</h1>
      <p>{L(c.settings.maintenanceText)}</p>
      <a className="button" href={telegramContact(c.settings, "maintenance", L(c.settings.telegramText))} target="_blank" rel="noreferrer">
        <TelegramIcon size={21} />{t.telegram}
      </a>
    </main>
  );
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
                                <span className="count">
                                  {c.games.filter((g) => g.featured).length}
                                </span>
                              </h2>
                            </div>
                          </div>
                          <div className="game-grid">
                            {c.games
                              .filter((g) => g.featured)
                              .slice(0, 6)
                              .map(card)}
                          </div>
                        </section>
                        {c.providers.map((provider) => (
                          <ProviderGames
                            key={provider.id}
                            provider={provider}
                            games={c.games.filter(
                              (g) => g.provider === provider.id,
                            )}
                            card={card}
                            L={L}
                            t={t}
                            href={href}
                          />
                        ))}
                        <Random c={c} t={t} L={L} href={href} />
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
                        {item.slug === "partners" && (
                          <a
                            className="button partner-contact"
                            href={telegramContact(
                              c.settings,
                              "partners",
                              t.partnerMessage,
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <TelegramIcon size={20} />
                            {t.contactOperator}
                          </a>
                        )}
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
                <div className="footer-top">
                  <a className="brand" href={href("home")}>
                    <img src={c.settings.logo} alt={c.settings.brand} />
                  </a>
                  <div className="footer-links">
                    {[
                      "about",
                      "partners",
                      "privacy",
                      "terms",
                      "help",
                      "app",
                    ].map((k) => (
                      <a href={href(k)} key={k}>
                        {t[k]}
                      </a>
                    ))}
                  </div>
                  <span className="age-seal">18+</span>
                </div>
                <div
                  className="footer-currencies"
                  aria-label="DASH, LTC, USDT, SOL"
                >
                  {["dash", "ltc", "usdt", "sol"].map((currency) => (
                    <span key={currency}>
                      <img
                        src={`/images/crypto-${currency}.webp`}
                        width="32"
                        height="32"
                        alt=""
                        loading="lazy"
                      />
                      <strong>{currency.toUpperCase()}</strong>
                    </span>
                  ))}
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
              href={telegramContact(c.settings, "floating", L(c.settings.telegramText))}
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
            <img className="age-lion" src="/images/lion-age.webp" alt="" />
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
    [cycle, setCycle] = useState(0),
    [paused, setPaused] = useState(false),
    [hidden, setHidden] = useState(false),
    [reduced, setReduced] = useState(false),
    [moving, setMoving] = useState(false),
    [dragging, setDragging] = useState(false);
  const [viewportRef, carousel] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: reduced ? 0 : 35,
    skipSnaps: false,
  });
  const elapsed = useRef(0),
    progress = useRef(null);
  const resetClock = () => {
    elapsed.current = 0;
    progress.current?.style.setProperty("--slide-progress", "0");
    setCycle((v) => v + 1);
  };
  const select = (next) => {
    if (!carousel) return;
    resetClock();
    carousel.scrollTo(next, reduced);
  };
  const change = (step) => {
    if (!carousel) return;
    resetClock();
    if (step > 0) carousel.scrollNext(reduced);
    else carousel.scrollPrev(reduced);
  };
  useEffect(() => {
    if (!carousel) return;
    const selected = () => {
      setIndex(carousel.selectedScrollSnap());
      resetClock();
    };
    const scroll = () => setMoving(true);
    const settle = () => setMoving(false);
    const down = () => setDragging(true);
    const up = () => setDragging(false);
    const reinit = () => {
      selected();
      settle();
      setDragging(false);
    };
    carousel
      .on("select", selected)
      .on("scroll", scroll)
      .on("settle", settle)
      .on("pointerDown", down)
      .on("pointerUp", up)
      .on("reInit", reinit);
    selected();
    return () => {
      carousel
        .off("select", selected)
        .off("scroll", scroll)
        .off("settle", settle)
        .off("pointerDown", down)
        .off("pointerUp", up)
        .off("reInit", reinit);
    };
  }, [carousel]);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setHidden(document.hidden);
    motion();
    visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      media.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  useEffect(() => {
    if (
      !carousel ||
      paused ||
      hidden ||
      reduced ||
      moving ||
      dragging ||
      slides.length < 2
    )
      return;
    let frame,
      previous = performance.now();
    const duration = Math.max(4, Number(seconds) || 7) * 1000;
    const tick = (now) => {
      elapsed.current += now - previous;
      previous = now;
      const value = Math.min(elapsed.current / duration, 1);
      progress.current?.style.setProperty("--slide-progress", String(value));
      if (value >= 1) {
        elapsed.current = 0;
        carousel.scrollNext();
      } else frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [
    carousel,
    index,
    cycle,
    seconds,
    paused,
    hidden,
    reduced,
    moving,
    dragging,
    slides.length,
  ]);
  if (!slides.length) return null;
  const s = slides[index % slides.length];
  return (
    <section
      className="hero banner-slider"
      data-peek={slides.length > 2}
      aria-roledescription="carousel"
      aria-label={t.offers}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          change(e.key === "ArrowLeft" ? -1 : 1);
        }
        if (e.key === " ") {
          e.preventDefault();
          setPaused((p) => !p);
        }
      }}
    >
      <h1 className="visually-hidden">{L(s.title)}</h1>
      <div className="banner-viewport" ref={viewportRef}>
        <div className="banner-track">
          {slides.map((slide, i) => {
            const active = i === index % slides.length;
            const art = (
              <>
              <img
                className="banner-image"
                src={L({ru: slide.imageRu, hy: slide.imageHy, en: slide.imageEn}) || slide.image}
                alt={L(slide.description) || L(slide.title)}
                loading="eager"
                fetchPriority={i === 0 ? "high" : "auto"}
                draggable="false"
              />
              {slide.showText && <div className="banner-copy">
                <span>{L(slide.label)}</span>
                <h2>{L(slide.title)}</h2>
                <p>{L(slide.description)}</p>
              </div>}
              </>
            );
            return (
              <div
                key={slide.id}
                className={"banner-slide" + (active ? " active" : "")}
                aria-hidden={!active}
                inert={!active ? true : undefined}
              >
                {slide.url ? (
                  <a
                    className="banner-link"
                    href={localizedUrl(slide.url)}
                    aria-label={L(slide.title)}
                  >
                    {art}
                  </a>
                ) : (
                  art
                )}
              </div>
            );
          })}
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="banner-arrow banner-arrow-prev"
            aria-label={t.prev}
            onClick={() => change(-1)}
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="banner-arrow banner-arrow-next"
            aria-label={t.next}
            onClick={() => change(1)}
          >
            <ChevronRight size={22} />
          </button>
          <div className="banner-pagination">
            {slides.map((slide, i) => (
              <button
                type="button"
                key={slide.id}
                className={i === index % slides.length ? "active" : ""}
                aria-label={`${t.slide} ${i + 1}`}
                aria-current={i === index % slides.length ? "true" : undefined}
                onClick={() => select(i)}
              >
                {i === index % slides.length && (
                  <span
                    key={cycle}
                    ref={progress}
                    className="banner-progress"
                    style={{ "--slide-progress": 0 }}
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="banner-pause"
            aria-label={paused ? t.resume : t.pause}
            onClick={() => setPaused((v) => !v)}
          >
            {paused ? t.resume : t.pause}
          </button>
        </>
      )}
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
function Random({ c, t, L, href }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const video = useRef(null);
  const [reel, setReel] = useState(() => createReel(c.games, 0));
  const [position, setPosition] = useState(1);
  const [moving, setMoving] = useState(false);
  const timer = useRef(),
    frames = useRef([]),
    pending = useRef(null);
  const reveal = () => {
    setCelebrating(false);
    setShowResult(true);
  };
  useEffect(() => {
    if (!celebrating) return;
    const clip = video.current;
    let cancelled = false;
    let fallback = setTimeout(reveal, 15000);
    // The clip is decorative: a playback failure must never block the selected game.
    if (clip) {
      const bounds = clip.getBoundingClientRect();
      if (bounds.top < 72 || bounds.bottom > window.innerHeight - 80)
        clip.scrollIntoView({ block: "center", behavior: "smooth" });
      clip.currentTime = 0;
      clip
        .play()
        ?.then(() => {
          if (cancelled) return;
          clearTimeout(fallback);
          fallback = setTimeout(
            reveal,
            Math.max(6, (clip.duration || 4) + 2) * 1000,
          );
        })
        .catch(() => {
          if (!cancelled) reveal();
        });
    }
    return () => {
      cancelled = true;
      clearTimeout(fallback);
      clip?.pause();
    };
  }, [celebrating]);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      frames.current.forEach(cancelAnimationFrame);
    },
    [],
  );
  const finish = () => {
    const run = pending.current;
    if (!run) return;
    pending.current = null;
    clearTimeout(timer.current);
    frames.current.forEach(cancelAnimationFrame);
    frames.current = [];
    setPosition(run.target);
    setMoving(false);
    setResult(run.winner);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCelebrating(!reduced);
    setShowResult(reduced);
    setBusy(false);
  };
  const spin = () => {
    if (pending.current || celebrating || !c.games.length) return;
    if (video.current && video.current.readyState < 2) {
      video.current.preload = "auto";
      video.current.load();
    }
    const n = new Uint32Array(1);
    crypto.getRandomValues(n);
    const run = createReel(
      c.games,
      Math.floor((n[0] / 4294967296) * c.games.length),
      result?.id,
    );
    pending.current = run;
    setReel(run);
    setResult(null);
    setShowResult(false);
    setBusy(true);
    setMoving(false);
    setPosition(1);
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish();
      return;
    }
    // Commit the reset strip before starting the next animation, including repeat spins.
    frames.current = [
      requestAnimationFrame(() => {
        frames.current.push(
          requestAnimationFrame(() => {
            setMoving(true);
            setPosition(run.target);
            timer.current = setTimeout(finish, 4400);
          }),
        );
      }),
    ];
  };
  return (
    <section className="random-section random-reel-section">
      <div className="lion-heading">
        <h2>{t.random}</h2>
        <p>{t.randomText}</p>
      </div>
      <div
        className={"lion-stage" + (celebrating ? " is-celebrating" : "")}
        aria-hidden="true"
      >
        <img
          className="lion-portrait"
          src={c.settings.lion}
          alt=""
          loading="lazy"
        />
        <video
          ref={video}
          className="lion-celebration"
          src="/media/lion-celebration.mp4"
          muted
          playsInline
          preload="none"
          onEnded={reveal}
          onError={() => {
            if (celebrating) reveal();
          }}
          tabIndex={-1}
        />
      </div>
      {c.games.length ? (
        <>
          <div
            className={
              "reel-machine " +
              (busy ? "is-spinning" : result ? "has-winner" : "")
            }
          >
            <svg
              className="reel-pointer"
              viewBox="0 0 42 46"
              aria-hidden="true"
            >
              <path
                d="M3 3h36L21 41Z"
                fill="#c739a5"
                stroke="#efce85"
                strokeWidth="5"
                strokeLinejoin="round"
              />
            </svg>
            <div className="reel-lights" aria-hidden="true" />
            <div
              className="reel-window"
              aria-busy={busy}
              aria-label={t.selection}
            >
              <div
                className="reel-track"
                style={{
                  "--reel-position": position,
                  transition: moving
                    ? "transform 4s cubic-bezier(.12,.72,.12,1)"
                    : "none",
                }}
                onTransitionEnd={(e) => {
                  if (
                    e.target === e.currentTarget &&
                    e.propertyName === "transform"
                  )
                    finish();
                }}
              >
                {reel.entries.map((g, i) => {
                  const selected = result && i === reel.target;
                  const art = (
                    <>
                      <img src={g.image} alt="" draggable="false" />
                      <span>{L(g.title)}</span>
                    </>
                  );
                  return selected ? (
                    <a
                      key={i}
                      className="reel-card selected"
                      href={href("games/" + g.slug)}
                      aria-label={`${t.play}: ${L(g.title)}`}
                    >
                      {art}
                    </a>
                  ) : (
                    <div key={i} className="reel-card" aria-hidden="true">
                      {art}
                    </div>
                  );
                })}
              </div>
              <div className="reel-center" aria-hidden="true" />
            </div>
            <div className="reel-lights" aria-hidden="true" />
          </div>
          <button
            type="button"
            className="paw-button"
            disabled={busy || celebrating}
            onClick={spin}
            aria-label={busy ? t.spinning : result ? t.again : t.spin}
          >
            <img src="/images/lion-paw.webp" alt="" draggable="false" />
            <span>{busy ? t.spinning : result ? t.again : t.spin}</span>
          </button>
          <div className="reel-result" aria-live="polite" aria-atomic="true">
            {busy ? (
              <p>{t.spinning}</p>
            ) : result ? (
              <button
                className="winner-summary"
                onClick={() => {
                  setCelebrating(false);
                  setShowResult(true);
                }}
              >
                <img src={result.image} alt="" />
                <span>{L(result.title)}</span>
                <Play size={18} />
              </button>
            ) : null}
          </div>
          {showResult && result && (
            <Modal
              title={t.winner}
              closeLabel={t.close}
              onClose={() => setShowResult(false)}
            >
              <div className="winner-reveal">
                <div className="winner-cover">
                  <div className="winner-sparks" aria-hidden="true">
                    {Array.from({ length: 8 }, (_, i) => (
                      <i
                        key={i}
                        style={{
                          "--spark-angle": `${i * 45}deg`,
                          "--spark-delay": `${i * 35}ms`,
                        }}
                      />
                    ))}
                  </div>
                  <img src={result.image} alt={L(result.title)} />
                  <span>
                    <Sparkles size={16} />
                    {t.selection}
                  </span>
                </div>
                <p>
                  {L(c.providers.find((p) => p.id === result.provider)?.title)}
                </p>
                <h3>{L(result.title)}</h3>
                <a className="button gold" href={href("games/" + result.slug)}>
                  <Play size={19} fill="currentColor" />
                  {t.play}
                </a>
                <button
                  className="text-button"
                  onClick={() => setShowResult(false)}
                >
                  {t.back}
                </button>
              </div>
            </Modal>
          )}
        </>
      ) : (
        <p className="empty">{t.empty}</p>
      )}
    </section>
  );
}
function SlotsIcon({ size = 24 }) {
  return (
    <img
      src="/images/nav-slots.png?v=8586374"
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className="slots-nav-icon"
    />
  );
}

function Registration({ c, lang, t, onClose }) {
  const [state, setState] = useState(""),
    [error, setError] = useState(""),
    [url, setUrl] = useState("");
  const [phone, setPhone] = useState({ country: "AM", number: "" });
  async function submit(e) {
    e.preventDefault();
    setError("");
    const internationalPhone = normalizePhone(phone.number, phone.country);
    if (!internationalPhone) {
      setError(t.phoneInvalid);
      return;
    }
    setState("pending");
    const f = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: internationalPhone,
          city: f.get("city"),
          adult: f.get("adult") === "on",
          telegram: f.get("telegram"),
          website: f.get("website"),
          consent: f.get("consent") === "on",
          termsAccepted: f.get("termsAccepted") === "on",
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
          <PhoneInput value={phone} onChange={setPhone} t={t} lang={lang} />
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
          <div className="check legal-consent">
            <input
              id="registration-terms"
              name="termsAccepted"
              type="checkbox"
              required
            />
            <div>
              <label htmlFor="registration-terms">{t.acceptTerms}</label>
              <a href={`/${lang}/terms`} target="_blank" rel="noreferrer">
                {t.terms}
              </a>
            </div>
          </div>
          <div className="check legal-consent">
            <input
              id="registration-consent"
              name="consent"
              type="checkbox"
              required
            />
            <div>
              <label htmlFor="registration-consent">{t.consent}</label>
              <a href={`/${lang}/privacy`} target="_blank" rel="noreferrer">
                {t.privacy}
              </a>
            </div>
          </div>
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
  return (
    <div className="provider-rail-wrap">
      <div
        className="provider-rail"
        onDragStart={(e) => e.preventDefault()}
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
        {onSelect ? (
          <button
            className={"provider-all " + (!selected ? "active" : "")}
            aria-pressed={!selected}
            onClick={() => onSelect("")}
          >
            <span className="provider-tile">
              <img
                src="/images/providers-all.png"
                width="35"
                height="35"
                alt=""
                draggable="false"
              />
            </span>
            <span className="provider-caption">{t.allProviders}</span>
          </button>
        ) : (
          <a className="provider-all" href={href("slots")}>
            <span className="provider-tile">
              <img
                src="/images/providers-all.png"
                width="35"
                height="35"
                alt=""
                draggable="false"
              />
            </span>
            <span className="provider-caption">{t.allProviders}</span>
          </a>
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
              <span className="provider-tile">{logo}</span>
              <span className="provider-caption">{label}</span>
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
              <span className="provider-tile">{logo}</span>
              <span className="provider-caption">{label}</span>
            </a>
          );
        })}
      </div>
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
            onClick={() => {
              document.cookie = `yvn_language=${code}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
            }}
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

function ProviderGames({ provider, games, card, L, t, href }) {
  const ref = useRef(null),
    drag = useRef(null),
    moved = useRef(false);
  if (!games.length) return null;
  const scroll = (direction) =>
    ref.current?.scrollBy({
      left: direction * ref.current.clientWidth * 0.8,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  return (
    <section className="section provider-games">
      <div className="section-heading">
        <h2>
          {L(provider.title)}
          <span className="count">{games.length}</span>
        </h2>
        <div className="game-row-actions">
          <a
            className="provider-view-all"
            href={href("providers/" + provider.slug)}
          >
            {t.allProviders}
            <ChevronRight size={16} />
          </a>
          <button
            className="icon-button"
            aria-label={`${t.previousGames}: ${L(provider.title)}`}
            onClick={() => scroll(-1)}
          >
            <ChevronLeft size={17} />
          </button>
          <button
            className="icon-button"
            aria-label={`${t.nextGames}: ${L(provider.title)}`}
            onClick={() => scroll(1)}
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
      <div
        className="provider-games-track"
        ref={ref}
        aria-label={L(provider.title)}
        onDragStart={(e) => e.preventDefault()}
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
        onPointerLeave={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
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
        {games.map(card)}
      </div>
    </section>
  );
}
