-- Schemat bazy danych: formularz zapytań ofertowych (wersja minimalna, bez ofertowania)
-- PostgreSQL 14+

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid()

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

  email_notification_sent boolean NOT NULL DEFAULT false,

  CONSTRAINT chk_shape_custom CHECK (shape <> 'custom' OR shape_custom_note IS NOT NULL),
  CONSTRAINT chk_design_brief CHECK (design_option <> 'agency_designs' OR design_brief IS NOT NULL),
  CONSTRAINT chk_quantity_fixed CHECK (quantity_mode <> 'fixed' OR quantity_fixed IS NOT NULL),
  CONSTRAINT chk_quantity_variants CHECK (quantity_mode <> 'multi_variant_request' OR quantity_variants_note IS NOT NULL)
);

CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
