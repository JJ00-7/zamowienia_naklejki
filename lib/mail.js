import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const SHAPE_LABELS = {
  rectangle: 'Prostokąt / kwadrat',
  circle_oval: 'Koło / owal',
  custom: 'Niestandardowy',
};
const DESIGN_LABELS = {
  client_provides_later: 'Klient dostarczy projekt później',
  agency_designs: 'Zlecenie przygotowania projektu',
};
const LAMINATION_LABELS = { none: 'Brak', gloss: 'Błysk', matte: 'Mat' };
const OUTPUT_LABELS = { single_pieces: 'Sztuki pojedyncze', sheets: 'Arkusze' };

function buildHtml(request) {
  const rows = [
    ['Firma', request.companyName],
    ['NIP', request.nip || '—'],
    ['Osoba kontaktowa', request.contactPerson],
    ['Telefon', request.phone],
    ['E-mail', request.email],
    ['Wymiary', `${request.widthMm} × ${request.heightMm} mm`],
    ['Kształt', SHAPE_LABELS[request.shape]],
    ...(request.shape === 'custom' ? [['Opis kształtu', request.shapeCustomNote]] : []),
    ['Projekt graficzny', DESIGN_LABELS[request.designOption]],
    ...(request.designOption === 'agency_designs' ? [['Wytyczne do projektu', request.designBrief]] : []),
    ['Laminat', LAMINATION_LABELS[request.lamination]],
    ['Wydanie', OUTPUT_LABELS[request.outputFormat]],
    [
      'Nakład',
      request.quantityMode === 'fixed'
        ? `${request.quantityFixed} szt.`
        : `kilka wariantów: ${request.quantityVariantsNote}`,
    ],
  ];

  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;font-weight:600;white-space:nowrap;">${label}</td><td style="padding:6px 12px;">${value}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:sans-serif;max-width:600px;">
      <h2 style="color:#c20f4d;">Nowe zapytanie ofertowe — naklejki</h2>
      <table style="border-collapse:collapse;width:100%;">${rowsHtml}</table>
      <p style="color:#888;font-size:12px;margin-top:16px;">Zapytanie #${request.id}</p>
    </div>
  `;
}

/**
 * Wysyła e-mail powiadamiający na skrzynkę firmową o nowym zapytaniu.
 * Zwraca true/false — wynik zapisywany w request.emailNotificationSent,
 * żeby dało się później znaleźć i ręcznie doręczyć te, które nie poszły.
 */
export async function sendNewRequestNotification(request) {
  if (!resend) {
    console.warn('RESEND_API_KEY nieustawiony — pomijam wysyłkę e-mail.');
    return false;
  }
  try {
    await resend.emails.send({
      from: process.env.MAIL_FROM || 'Zapytania <zapytania@twojadomena.pl>',
      to: process.env.SALES_NOTIFICATION_EMAIL,
      reply_to: request.email,
      subject: `Nowe zapytanie ofertowe: ${request.companyName}`,
      html: buildHtml(request),
    });
    return true;
  } catch (err) {
    console.error('Błąd wysyłki e-mail:', err);
    return false;
  }
}
