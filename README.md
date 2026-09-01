# Naklejki — formularz zapytań (wersja minimalna)

Zbiera zapytania ofertowe od klientów: formularz → zapis do bazy → e-mail
powiadamiający. Bez panelu admina, bez wyceniania, bez wysyłki ofert.
Pełny opis: [`SPEC.md`](./SPEC.md).

## Szybki start

```bash
npm install
cp .env.example .env
# uzupełnij DATABASE_URL, RESEND_API_KEY, MAIL_FROM, SALES_NOTIFICATION_EMAIL
npx prisma migrate dev --name init
npm run dev
```

Formularz jest dostępny pod `/`. Po wysłaniu:

1. zapytanie ląduje w tabeli `requests`,
2. na adres z `SALES_NOTIFICATION_EMAIL` leci e-mail ze wszystkimi polami
   zapytania (Resend), z `reply-to` ustawionym na adres klienta — możesz
   odpisać jednym kliknięciem.

## Jeśli nie chcesz używać Resend

`lib/mail.js` ma jedną funkcję `sendNewRequestNotification(request)` —
podmień jej wnętrze na dowolny inny dostawca SMTP (Nodemailer, SendGrid,
Postmark itd.), reszta aplikacji się nie zmienia.

## Jeśli później zechcesz dodać wycenę/panel admina

To dokładnie to, co było w poprzedniej, pełnej wersji tego projektu —
tabela `variants` (1:N do `requests`) + panel `/admin/requests/[id]` z
edytorem wariantów. Można ją dołożyć bez przebudowy tego, co jest tutaj.
