# Naklejki — formularz zapytań ofertowych (wersja minimalna)

Uproszczona wersja poprzedniego projektu: **zero panelu admina, zero wyceny,
zero wysyłki ofert**. Aplikacja robi dokładnie trzy rzeczy:

1. Pokazuje klientowi formularz zapytania ofertowego (ten sam zakres pól co wcześniej —
   dane kontaktowe, wymiary/kształt naklejki, projekt graficzny, laminat, wydanie, nakład).
2. Zapisuje zapytanie do bazy danych.
3. Wysyła e-mail z powiadomieniem na adres firmowy (np. `zamowienia@twojafirma.pl`)
   z treścią zapytania — dalsza obsługa (wycena, kontakt z klientem) dzieje się już
   poza aplikacją, np. mailowo lub w arkuszu.

Brak logowania, brak ról, brak statusów, brak relacji 1:N — jedna tabela.

---

## 1. Model danych

Jedna tabela `requests`. Te same pola co w pełnej wersji, minus wszystko
związane z ofertą/wyceną (`variants`, `offer_*`, `status`, `assigned_admin_id`,
`internal_notes`).

```sql
CREATE TYPE sticker_shape AS ENUM ('rectangle','circle_oval','custom');
CREATE TYPE design_option AS ENUM ('client_provides_later','agency_designs');
CREATE TYPE lamination_type AS ENUM ('none','gloss','matte');
CREATE TYPE output_format AS ENUM ('single_pieces','sheets');
CREATE TYPE quantity_mode AS ENUM ('fixed','multi_variant_request');

CREATE TABLE requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  company_name varchar(255) NOT NULL,
  nip varchar(15),
  contact_person varchar(255) NOT NULL,
  phone varchar(30) NOT NULL,
  email varchar(255) NOT NULL,

  width_mm integer NOT NULL CHECK (width_mm > 0),
  height_mm integer NOT NULL CHECK (height_mm > 0),
  shape sticker_shape NOT NULL,
  shape_custom_note text,

  design_option design_option NOT NULL,
  design_brief text,

  lamination lamination_type NOT NULL,
  output_format output_format NOT NULL,

  quantity_mode quantity_mode NOT NULL,
  quantity_fixed integer,
  quantity_variants_note text,

  email_notification_sent boolean NOT NULL DEFAULT false
);
```

`email_notification_sent` to jedyna "operacyjna" kolumna — pozwala odróżnić
zapytania, przy których wysyłka maila się nie powiodła (np. limit Resend),
żeby dało się je łatwo znaleźć i wysłać ręcznie.

---

## 2. Przepływ

```
KLIENT                              SYSTEM
──────                              ──────
1. Wchodzi na "/"
2. Wypełnia formularz
3. Wysyła ──────────────────▶ POST /api/requests
                                → walidacja (Zod)
                                → zapis do `requests`
                                → e-mail powiadamiający na adres firmowy
   ◀── ekran "Dziękujemy,
       odezwiemy się"
```

To wszystko — nie ma już etapu "admin tworzy warianty" ani "klient
akceptuje ofertę online". Odpowiedź do klienta wraca tradycyjnie (telefon/mail)
na podstawie treści powiadomienia.

---

## 3. Struktura projektu

```
naklejki-formularz/
├── prisma/schema.prisma
├── schema.sql
├── lib/
│   ├── prisma.js
│   └── mail.js          # wysyłka powiadomienia przez Resend
├── components/
│   └── ClientRequestForm.jsx
├── app/
│   ├── globals.css
│   ├── page.jsx
│   └── api/requests/route.js
├── package.json
├── .env.example
└── README.md
```

## 4. Co dostajesz w e-mailu powiadomienia

Zwykły, czytelny tekst/HTML z wszystkimi polami zapytania — traktuj go jak
zamiennik "nowego wiersza w arkuszu", żeby można było od razu zadzwonić/odpisać
klientowi bez logowania się do żadnego panelu.
