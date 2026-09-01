'use client';

import { useState } from 'react';

const initialState = {
  companyName: '',
  nip: '',
  contactPerson: '',
  phone: '',
  email: '',
  widthMm: '',
  heightMm: '',
  shape: 'rectangle',
  shapeCustomNote: '',
  designOption: 'client_provides_later',
  designBrief: '',
  lamination: 'none',
  outputFormat: 'single_pieces',
  quantityMode: 'fixed',
  quantityFixed: '',
  quantityVariantsNote: '',
};

// Prosty, samodzielny komponent "wybieralnej karty" — używany wielokrotnie
// dla kształtu / laminatu / wydania / nakładu, żeby formularz czytał się
// jak zestaw naklejek do wyboru, a nie generyczny <select>.
function ChoiceCard({ active, onClick, title, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-active={active}
      className="choice-card text-left"
    >
      <div className="font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </div>
      {subtitle && <div className="text-sm opacity-70 mt-0.5">{subtitle}</div>}
    </button>
  );
}

function SectionEyebrow({ children, tone = 'pink' }) {
  return <span className={`sticker-badge ${tone}`}>{children}</span>;
}

export default function ClientRequestForm() {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error

  const set = (key) => (eOrValue) => {
    const value = eOrValue?.target ? eOrValue.target.value : eOrValue;
    setForm((f) => ({ ...f, [key]: value }));
  };

  function validate() {
    const e = {};
    if (!form.companyName.trim()) e.companyName = 'Podaj nazwę firmy.';
    if (!form.contactPerson.trim()) e.contactPerson = 'Podaj osobę kontaktową.';
    if (!form.phone.trim()) e.phone = 'Podaj numer telefonu.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Podaj poprawny adres e-mail.';
    if (!form.widthMm || Number(form.widthMm) <= 0) e.widthMm = 'Podaj szerokość w mm.';
    if (!form.heightMm || Number(form.heightMm) <= 0) e.heightMm = 'Podaj wysokość w mm.';
    if (form.shape === 'custom' && !form.shapeCustomNote.trim())
      e.shapeCustomNote = 'Opisz krótko niestandardowy kształt.';
    if (form.designOption === 'agency_designs' && !form.designBrief.trim())
      e.designBrief = 'Napisz, czego potrzebujesz — zleceniodawca nie wgrywa tu plików, opisz wytyczne.';
    if (form.quantityMode === 'fixed' && (!form.quantityFixed || Number(form.quantityFixed) <= 0))
      e.quantityFixed = 'Podaj nakład (szt.).';
    if (form.quantityMode === 'multi_variant_request' && !form.quantityVariantsNote.trim())
      e.quantityVariantsNote = 'Wpisz orientacyjne progi ilościowe, które chcesz porównać.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('request_failed');
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="max-w-xl mx-auto mt-24 panel p-10 text-center">
        <SectionEyebrow tone="mustard">Wysłano!</SectionEyebrow>
        <h1 className="text-3xl mt-4 mb-3">Dzięki, mamy Twoje zapytanie 🌶️</h1>
        <p className="opacity-80">
          Przejrzymy Twoje zapytanie i odezwiemy się mailowo lub telefonicznie
          zwykle w ciągu 24h roboczych.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-14 px-4 space-y-10">
      <header className="text-center space-y-3">
        <SectionEyebrow>Zapytanie ofertowe</SectionEyebrow>
        <h1 className="text-4xl md:text-5xl" style={{ color: 'var(--hot-pink-deep)' }}>
          Formularz zamówienia naklejek
        </h1>
        <p className="opacity-70">
          Papier samoprzylepny, klej standardowy — reszta wykończenia jest Twoja.
        </p>
      </header>

      {/* Dane kontaktowe */}
      <section className="panel p-6 space-y-4">
        <SectionEyebrow tone="lavender">01 · Dane kontaktowe</SectionEyebrow>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="field-label">Firma</label>
            <input className="field-input" value={form.companyName} onChange={set('companyName')} />
            {errors.companyName && <p className="text-sm text-red-600 mt-1">{errors.companyName}</p>}
          </div>
          <div>
            <label className="field-label">NIP</label>
            <input className="field-input" value={form.nip} onChange={set('nip')} placeholder="opcjonalnie" />
          </div>
          <div>
            <label className="field-label">Osoba kontaktowa</label>
            <input className="field-input" value={form.contactPerson} onChange={set('contactPerson')} />
            {errors.contactPerson && <p className="text-sm text-red-600 mt-1">{errors.contactPerson}</p>}
          </div>
          <div>
            <label className="field-label">Telefon</label>
            <input className="field-input" value={form.phone} onChange={set('phone')} />
            {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="field-label">E-mail</label>
            <input className="field-input" value={form.email} onChange={set('email')} />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>
        </div>
      </section>

      {/* Parametry naklejki */}
      <section className="panel p-6 space-y-4">
        <SectionEyebrow tone="orange">02 · Parametry naklejki</SectionEyebrow>
        <div className="grid sm:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="field-label">Szerokość (mm)</label>
            <input type="number" className="field-input" value={form.widthMm} onChange={set('widthMm')} />
            {errors.widthMm && <p className="text-sm text-red-600 mt-1">{errors.widthMm}</p>}
          </div>
          <div>
            <label className="field-label">Wysokość (mm)</label>
            <input type="number" className="field-input" value={form.heightMm} onChange={set('heightMm')} />
            {errors.heightMm && <p className="text-sm text-red-600 mt-1">{errors.heightMm}</p>}
          </div>
        </div>
        <div>
          <label className="field-label">Kształt</label>
          <div className="grid sm:grid-cols-3 gap-3">
            <ChoiceCard title="Prostokąt / kwadrat" active={form.shape === 'rectangle'} onClick={() => set('shape')('rectangle')} />
            <ChoiceCard title="Koło / owal" active={form.shape === 'circle_oval'} onClick={() => set('shape')('circle_oval')} />
            <ChoiceCard title="Niestandardowy" active={form.shape === 'custom'} onClick={() => set('shape')('custom')} />
          </div>
          {form.shape === 'custom' && (
            <div className="mt-3">
              <textarea
                className="field-input"
                rows={2}
                placeholder="Opisz kształt (np. kontur maskotki, litera firmy...)"
                value={form.shapeCustomNote}
                onChange={set('shapeCustomNote')}
              />
              {errors.shapeCustomNote && <p className="text-sm text-red-600 mt-1">{errors.shapeCustomNote}</p>}
            </div>
          )}
        </div>
      </section>

      {/* Projekt graficzny */}
      <section className="panel p-6 space-y-4">
        <SectionEyebrow tone="pink">03 · Projekt graficzny</SectionEyebrow>
        <p className="text-sm opacity-70 -mt-1">
          Materiał to zawsze papier samoprzylepny z klejem standardowym — tego pola nie
          trzeba wybierać. Pliku graficznego nie wgrywasz tutaj.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <ChoiceCard
            title="Dostarczę projekt później"
            subtitle="Po przesłaniu kosztorysu poproszę o plik w mailu zwrotnym."
            active={form.designOption === 'client_provides_later'}
            onClick={() => set('designOption')('client_provides_later')}
          />
          <ChoiceCard
            title="Zlecam przygotowanie projektu"
            subtitle="Opisz mi swój pomysł. Podaj jak najwięcej informacji, żebym mogła przygotować idealną wycenę."
            active={form.designOption === 'agency_designs'}
            onClick={() => set('designOption')('agency_designs')}
          />
        </div>
        {form.designOption === 'agency_designs' && (
          <div>
            <label className="field-label">Wytyczne do projektu</label>
            <textarea
              className="field-input"
              rows={4}
              placeholder="Np. logo + hasło, kolory marki, styl, inspiracje..."
              value={form.designBrief}
              onChange={set('designBrief')}
            />
            {errors.designBrief && <p className="text-sm text-red-600 mt-1">{errors.designBrief}</p>}
          </div>
        )}
      </section>

      {/* Wykończenie i wydanie */}
      <section className="panel p-6 space-y-4">
        <SectionEyebrow tone="mustard">04 · Wykończenie i wydanie</SectionEyebrow>
        <div>
          <label className="field-label">Laminat</label>
          <div className="grid sm:grid-cols-3 gap-3">
            <ChoiceCard title="Brak" active={form.lamination === 'none'} onClick={() => set('lamination')('none')} />
            <ChoiceCard title="Błysk" active={form.lamination === 'gloss'} onClick={() => set('lamination')('gloss')} />
            <ChoiceCard title="Mat" active={form.lamination === 'matte'} onClick={() => set('lamination')('matte')} />
          </div>
        </div>
        <div>
          <label className="field-label">Wydanie</label>
          <div className="grid sm:grid-cols-2 gap-3">
            <ChoiceCard title="Sztuki pojedyncze" active={form.outputFormat === 'single_pieces'} onClick={() => set('outputFormat')('single_pieces')} />
            <ChoiceCard title="Arkusze (format A4)" active={form.outputFormat === 'sheets'} onClick={() => set('outputFormat')('sheets')} />
          </div>
        </div>
      </section>

      {/* Nakład */}
      <section className="panel p-6 space-y-4">
        <SectionEyebrow tone="lavender">05 · Nakład</SectionEyebrow>
        <div className="grid sm:grid-cols-2 gap-3">
          <ChoiceCard
            title="Podaję jeden nakład"
            active={form.quantityMode === 'fixed'}
            onClick={() => set('quantityMode')('fixed')}
          />
          <ChoiceCard
            title="Poproszę o kilka wariantów ilościowych"
            active={form.quantityMode === 'multi_variant_request'}
            onClick={() => set('quantityMode')('multi_variant_request')}
          />
        </div>
        {form.quantityMode === 'fixed' ? (
          <div>
            <label className="field-label">Nakład (szt.)</label>
            <input type="number" className="field-input" value={form.quantityFixed} onChange={set('quantityFixed')} />
            {errors.quantityFixed && <p className="text-sm text-red-600 mt-1">{errors.quantityFixed}</p>}
          </div>
        ) : (
          <div>
            <label className="field-label">Jakie progi ilościowe Cię interesują?</label>
            <textarea
              className="field-input"
              rows={2}
              placeholder="Np. 100 / 250 / 500 szt."
              value={form.quantityVariantsNote}
              onChange={set('quantityVariantsNote')}
            />
            {errors.quantityVariantsNote && <p className="text-sm text-red-600 mt-1">{errors.quantityVariantsNote}</p>}
          </div>
        )}
      </section>

      <div className="flex flex-col items-center gap-3 pt-2">
        <button type="submit" disabled={status === 'submitting'} className="btn-pop primary text-lg">
          {status === 'submitting' ? 'Wysyłanie…' : 'Wyślij zapytanie 🌶️'}
        </button>
        {status === 'error' && (
          <p className="text-sm text-red-600">Coś poszło nie tak, spróbuj ponownie.</p>
        )}
      </div>
    </form>
  );
}
