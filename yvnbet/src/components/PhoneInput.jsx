import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import {
  countryOptions,
  countryName,
  getCountryCallingCode,
  internationalCountry,
} from "../phone.mjs";
export default function PhoneInput({ value, onChange, t, lang }) {
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState("");
  const root = useRef(null),
    trigger = useRef(null),
    search = useRef(null),
    optionsRef = useRef(null);
  const countries = useMemo(() => countryOptions(lang, query), [lang, query]);
  const selectedName = countryName(value.country, lang);
  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const outside = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const choose = (country) => {
    onChange({ ...value, country });
    setOpen(false);
    setQuery("");
    trigger.current?.focus();
  };
  return (
    <div
      className="phone-field"
      ref={root}
      onKeyDown={(e) => {
        if (e.key === "Escape" && open) {
          e.preventDefault();
          e.stopPropagation();
          setOpen(false);
          trigger.current?.focus();
        }
      }}
    >
      <label htmlFor="registration-phone">{t.phone}</label>
      <div className="phone-controls">
        <button
          type="button"
          className="country-trigger"
          ref={trigger}
          aria-label={`${t.country}: ${selectedName} +${getCountryCallingCode(value.country)}`}
          aria-expanded={open}
          aria-controls="country-picker"
          onClick={() => {
            setOpen(!open);
            setQuery("");
          }}
        >
          <img
            src={`/images/flag-${value.country}.svg`}
            alt=""
            width="24"
            height="18"
          />
          <span>+{getCountryCallingCode(value.country)}</span>
          <ChevronDown size={14} />
        </button>
        <input
          id="registration-phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          required
          minLength={4}
          maxLength={25}
          placeholder="00 123456"
          value={value.number}
          onChange={(e) =>
            onChange({
              country: internationalCountry(e.target.value) || value.country,
              number: e.target.value,
            })
          }
        />
      </div>
      {open && (
        <div id="country-picker" className="country-picker">
          <div className="country-search">
            <Search size={17} />
            <input
              ref={search}
              type="search"
              aria-label={t.countrySearch}
              placeholder={t.countrySearch}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (countries.length === 1) choose(countries[0].code);
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  optionsRef.current?.querySelector("button")?.focus();
                }
              }}
            />
          </div>
          <div
            className="country-options"
            ref={optionsRef}
            role="group"
            aria-label={t.country}
            onKeyDown={(e) => {
              if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key))
                return;
              const buttons = [...e.currentTarget.querySelectorAll("button")],
                i = buttons.indexOf(document.activeElement);
              e.preventDefault();
              buttons[
                e.key === "Home"
                  ? 0
                  : e.key === "End"
                    ? buttons.length - 1
                    : Math.max(
                        0,
                        Math.min(
                          buttons.length - 1,
                          i + (e.key === "ArrowDown" ? 1 : -1),
                        ),
                      )
              ]?.focus();
            }}
          >
            {countries.map((c) => (
              <button
                type="button"
                key={c.code}
                aria-pressed={c.code === value.country}
                onClick={() => choose(c.code)}
              >
                <img
                  src={`/images/flag-${c.code}.svg`}
                  alt=""
                  loading="lazy"
                  width="24"
                  height="18"
                />
                <span>{c.name}</span>
                <small>+{c.dial}</small>
                {c.code === value.country && <Check size={14} />}
              </button>
            ))}
            {!countries.length && <p>{t.countryEmpty}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
