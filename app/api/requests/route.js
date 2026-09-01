import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '../../../lib/prisma';
import { sendNewRequestNotification } from '../../../lib/mail';

const RequestSchema = z
  .object({
    companyName: z.string().min(1),
    nip: z.string().optional().nullable(),
    contactPerson: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email(),
    widthMm: z.coerce.number().int().positive(),
    heightMm: z.coerce.number().int().positive(),
    shape: z.enum(['rectangle', 'circle_oval', 'custom']),
    shapeCustomNote: z.string().optional().nullable(),
    designOption: z.enum(['client_provides_later', 'agency_designs']),
    designBrief: z.string().optional().nullable(),
    lamination: z.enum(['none', 'gloss', 'matte']),
    outputFormat: z.enum(['single_pieces', 'sheets']),
    quantityMode: z.enum(['fixed', 'multi_variant_request']),
    // Toleruje brak wartości, pusty string lub null w trybie wariantów
    quantityFixed: z.preprocess(
      (val) => (val === '' || val === null || val === undefined ? null : val),
      z.coerce.number().int().positive().optional().nullable()
    ),
    quantityVariantsNote: z.string().optional().nullable(),
    additionalNotes: z.string().optional().nullable(),
  })
  .refine((d) => d.shape !== 'custom' || !!d.shapeCustomNote, {
    message: 'shapeCustomNote wymagane dla kształtu niestandardowego',
    path: ['shapeCustomNote'],
  })
  .refine((d) => d.designOption !== 'agency_designs' || !!d.designBrief, {
    message: 'designBrief wymagane przy zleceniu projektu',
    path: ['designBrief'],
  })
  .refine((d) => d.quantityMode !== 'fixed' || (d.quantityFixed !== null && d.quantityFixed !== undefined), {
    message: 'quantityFixed wymagane dla trybu fixed',
    path: ['quantityFixed'],
  })
  .refine((d) => d.quantityMode !== 'multi_variant_request' || !!d.quantityVariantsNote, {
    message: 'quantityVariantsNote wymagane dla trybu multi_variant_request',
    path: ['quantityVariantsNote'],
  });

export async function POST(req) {
  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // 1) Zapis do bazy
  const request = await prisma.request.create({ data: parsed.data });

  // 2) Powiadomienie e-mail — wynik zapisujemy z powrotem, żeby dało się
  // znaleźć zapytania, przy których wysyłka się nie powiodła.
  const sent = await sendNewRequestNotification(request);
  if (sent) {
    await prisma.request.update({
      where: { id: request.id },
      data: { emailNotificationSent: true },
    });
  }

  return NextResponse.json({ id: request.id }, { status: 201 });
}
