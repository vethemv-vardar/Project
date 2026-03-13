-- =====================================================
-- 500 hatası düzeltmesi: ratings tablosuna device_token ekle
-- Supabase > SQL Editor > New Query > Bu dosyayı yapıştır > Run
-- =====================================================

-- 1) ratings tablosunda device_token kolonu yoksa ekle
ALTER TABLE ratings ADD COLUMN IF NOT EXISTS device_token TEXT;

-- 2) instructors tablosu yoksa oluştur (hoca listesi için)
CREATE TABLE IF NOT EXISTS instructors (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  title      TEXT,
  phone      TEXT,
  emoji      TEXT DEFAULT '👨',
  exp        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) student_id NULL kabul etsin (anonim oylar için)
-- Not: Zaten REFERENCES ile NULL izin veriliyor; gerekirse aşağıyı çalıştır.
-- ALTER TABLE ratings ALTER COLUMN student_id DROP NOT NULL;  -- sadece hata alırsan
