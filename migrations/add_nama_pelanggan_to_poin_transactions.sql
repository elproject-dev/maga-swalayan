-- ==============================================================================
-- Migration: Tambah Kolom 'nama_pelanggan' pada Tabel 'poin_transactions'
-- ==============================================================================
-- Jalankan script SQL ini di Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql

-- 1. Tambah kolom nama_pelanggan jika belum ada
ALTER TABLE public.poin_transactions 
ADD COLUMN IF NOT EXISTS nama_pelanggan TEXT;

-- 2. Berikan index opsional untuk mempercepat pencarian nama jika diperlukan
CREATE INDEX IF NOT EXISTS idx_poin_transactions_nama_pelanggan 
ON public.poin_transactions (nama_pelanggan);

-- 3. (Opsional / Rekomendasi) Backfill data nama pelanggan yang sudah ada
-- Mengisi kolom nama_pelanggan dari tabel pelanggan yang cocok dengan membercard / nomor telepon
UPDATE public.poin_transactions pt
SET nama_pelanggan = p.name
FROM public.pelanggan p
WHERE (pt.nama_pelanggan IS NULL OR pt.nama_pelanggan = '')
  AND (
    (pt.membercard IS NOT NULL AND pt.membercard <> '' AND pt.membercard = p.membercard)
    OR 
    (pt.notelp IS NOT NULL AND pt.notelp <> '' AND (pt.notelp = p.phone OR '0' || SUBSTRING(pt.notelp FROM 3) = p.phone))
  );

-- Beritahukan status selesai
COMMENT ON COLUMN public.poin_transactions.nama_pelanggan IS 'Nama lengkap pelanggan pada saat transaksi poin';
