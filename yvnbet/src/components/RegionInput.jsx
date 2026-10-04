import React, { useState } from 'react';
import { regionOptions } from '../regions.mjs';
export default function RegionInput({lang, label, country}) {
  const [value, setValue] = useState(''), [open, setOpen] = useState(false), [active, setActive] = useState(-1);
  const options = country === 'AM' ? regionOptions(lang, value) : [];
  const hint = {ru:'Выберите из списка или введите свой регион', hy:'Ընտրեք ցանկից կամ մուտքագրեք ձեր համայնքը', en:'Choose from the list or enter your region'}[lang];
  const choose = (option) => { setValue(option.name); setOpen(false); setActive(-1); };
  return <div className="region-field" onBlur={e => {if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);}}>
    <label htmlFor="registration-region">{label}</label>
    <input id="registration-region" name="city" required minLength={2} maxLength={100}
      autoComplete="address-level1" value={value} role="combobox" aria-autocomplete="list"
      aria-expanded={open && options.length > 0} aria-controls="region-options"
      aria-activedescendant={open && active >= 0 ? `region-${active}` : undefined}
      aria-describedby="region-hint"
      onFocus={() => setOpen(true)}
      onChange={e => {setValue(e.target.value); setOpen(true); setActive(-1);}}
      onKeyDown={e => {
        if(e.key === 'Escape' && open) {e.preventDefault(); e.stopPropagation(); setOpen(false);}
        if(['ArrowDown','ArrowUp'].includes(e.key) && options.length) {
          e.preventDefault(); setOpen(true);
          const next = Math.max(0, Math.min(options.length - 1, active + (e.key === 'ArrowDown' ? 1 : -1)));
          setActive(next); document.getElementById(`region-${next}`)?.scrollIntoView({block:'nearest'});
        }
        if(e.key === 'Enter' && open && active >= 0 && options[active]) {e.preventDefault(); choose(options[active]);}
      }} />
    <small id="region-hint">{hint}</small>
    {open && options.length > 0 && <div className="region-options" id="region-options" role="listbox" aria-label={label}>
      {options.map((o,i) => <div key={o.name + o.region} id={`region-${i}`} role="option" aria-selected={i === active}
        onMouseDown={e=>e.preventDefault()} onClick={()=>choose(o)}>
        <span>{o.name}</span><small>{o.region}</small>
      </div>)}
    </div>}
  </div>;
}
