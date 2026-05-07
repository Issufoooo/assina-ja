-- AssinaJá Initial Schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE public.contract_status AS ENUM ('draft','pending','completed','expired');
CREATE TYPE public.signer_status   AS ENUM ('pending','viewed','otp_verified','signed');
CREATE TYPE public.signature_type  AS ENUM ('drawn','typed');
CREATE TYPE public.event_type AS ENUM ('contract_created','signer_invited','signer_viewed','otp_sent','otp_verified','otp_failed','signer_signed','contract_finalized','link_expired','contract_revoked');
CREATE TYPE public.document_access_mode AS ENUM ('key_required','owner_only','public');

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  avatar_url TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.contracts (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(), owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200), description TEXT CHECK (char_length(description) <= 1000),
  status public.contract_status NOT NULL DEFAULT 'draft', original_pdf_path TEXT, finalized_pdf_path TEXT,
  document_hash TEXT CHECK (document_hash IS NULL OR char_length(document_hash) = 64), expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_contracts_owner_id ON public.contracts(owner_id);
CREATE INDEX idx_contracts_status   ON public.contracts(status);

CREATE TABLE public.contract_signers (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 120),
  email TEXT CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) BETWEEN 7 AND 30),
  CONSTRAINT chk_signer_contact CHECK (email IS NOT NULL OR phone IS NOT NULL),
  signing_token TEXT NOT NULL UNIQUE, status public.signer_status NOT NULL DEFAULT 'pending',
  signature_data TEXT, signature_type public.signature_type,
  ip_address TEXT, user_agent TEXT, viewed_at TIMESTAMPTZ, otp_verified_at TIMESTAMPTZ,
  document_read_at TIMESTAMPTZ, signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_signers_token ON public.contract_signers(signing_token);
CREATE        INDEX idx_signers_contract_id ON public.contract_signers(contract_id);

-- NOTE: otp_codes.code now stores HMAC-SHA256 hash (64 hex chars), not plaintext
CREATE TABLE public.otp_codes (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(), signer_id UUID NOT NULL REFERENCES public.contract_signers(id) ON DELETE CASCADE,
  code TEXT NOT NULL, -- HMAC-SHA256 hex (64 chars)
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT FALSE, attempts SMALLINT NOT NULL DEFAULT 0 CHECK (attempts >= 0 AND attempts <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_otp_signer_id ON public.otp_codes(signer_id);

CREATE TABLE public.contract_events (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  signer_id UUID REFERENCES public.contract_signers(id) ON DELETE SET NULL, event_type public.event_type NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}', ip_address TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_events_contract_id ON public.contract_events(contract_id);

CREATE TABLE public.finalized_documents (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(), contract_id UUID NOT NULL UNIQUE REFERENCES public.contracts(id) ON DELETE RESTRICT,
  storage_path TEXT NOT NULL, file_size_bytes BIGINT, sha256_hash TEXT NOT NULL CHECK (char_length(sha256_hash) = 64),
  signed_by JSONB NOT NULL DEFAULT '[]',
  verification_id TEXT NOT NULL UNIQUE CHECK (verification_id ~ '^ASJA-[0-9]{4}-[A-Z0-9]{6}$'),
  verification_key TEXT NOT NULL, -- bcrypt hash of raw 24-char key
  verification_qr_path TEXT, is_publicly_verifiable BOOLEAN NOT NULL DEFAULT TRUE,
  document_access_mode public.document_access_mode NOT NULL DEFAULT 'key_required', revoked_at TIMESTAMPTZ,
  finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.fn_set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;
CREATE TRIGGER trg_profiles_updated_at  BEFORE UPDATE ON public.profiles         FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
CREATE TRIGGER trg_contracts_updated_at BEFORE UPDATE ON public.contracts         FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
CREATE TRIGGER trg_signers_updated_at   BEFORE UPDATE ON public.contract_signers  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

CREATE OR REPLACE FUNCTION public.fn_handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data ->> 'full_name'), ''), 'Utilizador')) ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER trg_on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.fn_handle_new_user();

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_signers    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_events     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finalized_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "contracts_owner_select" ON public.contracts FOR SELECT USING (owner_id = auth.uid());
CREATE POLICY "contracts_owner_insert" ON public.contracts FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "contracts_owner_update" ON public.contracts FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "signers_owner_select" ON public.contract_signers FOR SELECT USING (contract_id IN (SELECT id FROM public.contracts WHERE owner_id = auth.uid()));
CREATE POLICY "signers_owner_insert" ON public.contract_signers FOR INSERT WITH CHECK (contract_id IN (SELECT id FROM public.contracts WHERE owner_id = auth.uid()));
CREATE POLICY "events_owner_select" ON public.contract_events FOR SELECT USING (contract_id IN (SELECT id FROM public.contracts WHERE owner_id = auth.uid()));
CREATE POLICY "finalized_owner_select" ON public.finalized_documents FOR SELECT USING (contract_id IN (SELECT id FROM public.contracts WHERE owner_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.fn_all_signers_signed(p_contract_id UUID) RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*) > 0 AND COUNT(*) FILTER (WHERE status != 'signed') = 0 FROM public.contract_signers WHERE contract_id = p_contract_id;
$$;

CREATE OR REPLACE FUNCTION public.fn_get_verification_data(p_verification_id TEXT)
RETURNS TABLE (verification_id TEXT, is_publicly_verifiable BOOLEAN, revoked_at TIMESTAMPTZ, contract_title TEXT, finalized_at TIMESTAMPTZ, signer_count INT, sha256_hash TEXT, signed_by JSONB, document_access_mode public.document_access_mode)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT fd.verification_id, fd.is_publicly_verifiable, fd.revoked_at, c.title, fd.finalized_at, CAST(jsonb_array_length(fd.signed_by) AS INT), fd.sha256_hash, fd.signed_by, fd.document_access_mode
  FROM public.finalized_documents fd JOIN public.contracts c ON c.id = fd.contract_id
  WHERE fd.verification_id = p_verification_id;
$$;
