-- =====================================================
-- DriveAcademy - Supabase SQL Şeması
-- Supabase > SQL Editor > New Query > Buraya yapıştır > Run
-- =====================================================

CREATE TABLE IF NOT EXISTS students (
  id                  SERIAL PRIMARY KEY,
  username            TEXT UNIQUE NOT NULL,
  name                TEXT NOT NULL,
  tc                  TEXT NOT NULL,
  group_name          TEXT NOT NULL DEFAULT 'B',
  lessons_completed   INT DEFAULT 0,
  total_lessons       INT DEFAULT 40,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Hocalar
CREATE TABLE IF NOT EXISTS instructors (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  title      TEXT,
  phone      TEXT,
  emoji      TEXT DEFAULT '👨',
  exp        TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hoca puanlamaları
CREATE TABLE IF NOT EXISTS ratings (
  id            SERIAL PRIMARY KEY,
  student_id    INT REFERENCES students(id) ON DELETE CASCADE,
  instructor_id INT NOT NULL,
  month_key     TEXT NOT NULL,   -- örn: "2025-03"
  star          INT NOT NULL CHECK (star BETWEEN 1 AND 5),
  comment       TEXT DEFAULT '',
  device_token  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, instructor_id, month_key)  -- ayda 1 oy
);

-- Duyurular
CREATE TABLE IF NOT EXISTS announcements (
  id         SERIAL PRIMARY KEY,
  icon       TEXT DEFAULT '📢',
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dersler
CREATE TABLE IF NOT EXISTS lessons (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  instructor  TEXT NOT NULL,
  vehicle     TEXT NOT NULL,
  lesson_date TEXT NOT NULL,
  duration    TEXT DEFAULT '50 dk',
  location    TEXT NOT NULL,
  address     TEXT NOT NULL,
  status      TEXT DEFAULT 'upcoming',
  note        TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── DEMO VERİLER ────────────────────────────────────────────

INSERT INTO students (username, name, tc, group_name, lessons_completed) VALUES
  ('ahmet123', 'Ahmet Yılmaz',  '123****789', 'B', 26),
  ('fatma456', 'Fatma Demir',   '456****321', 'B', 12),
  ('mehmet789','Mehmet Kaya',   '789****123', 'B', 5)
ON CONFLICT (username) DO NOTHING;

INSERT INTO announcements (icon, title, body) VALUES
  ('📢', 'Sınav Tarihi Açıklandı',       'Teorik sınav 28 Mart 2025 Cuma günü saat 10:00''da yapılacak.'),
  ('🚗', 'Direksiyon Dersi Değişikliği', 'Yarınki ders saati 14:00''dan 15:30''a alındı.'),
  ('🎉', 'Yeni Simülatör Geldi!',        'Kurs binamıza yeni direksiyon simülatörü kuruldu.'),
  ('📋', 'Evrak Hatırlatması',           'Eksik evrakı olanlar en geç Cuma gününe kadar kursa teslim etmelidir.');

INSERT INTO lessons (title, instructor, vehicle, lesson_date, location, address, status, note) VALUES
  ('1. Direksiyon Dersi', 'Murat Bey',  '34 ABC 123', 'Dün, 10:00',     'Kadıköy Pist Alanı', 'Atatürk Cad. No:45, Kadıköy / İstanbul', 'done',     'Temel araç kontrolü yapıldı.'),
  ('2. Direksiyon Dersi', 'Murat Bey',  '34 ABC 123', 'Bugün, 14:00',   'E-5 Çalışma Yolu',   'E-5 Yan Yol, Bağcılar / İstanbul',       'upcoming', 'Park manevraları çalışılacak.'),
  ('3. Direksiyon Dersi', 'Ayşe Hanım', '34 XYZ 456', 'Yarın, 15:30',   'Kadıköy Pist Alanı', 'Atatürk Cad. No:45, Kadıköy / İstanbul', 'upcoming', 'Şehir içi sürüş.'),
  ('4. Direksiyon Dersi', 'Ali Bey',    '34 DEF 789', '25 Mart, 11:00', 'TEM Bağlantı Yolu',  'TEM Bağlantı, Başakşehir / İstanbul',    'upcoming', 'Otoyol sürüşü.');

-- ─── GÜVENLİK: Row Level Security ────────────────────────────
-- Backend service_role key ile erişeceği için RLS'yi kapat
ALTER TABLE students     DISABLE ROW LEVEL SECURITY;
ALTER TABLE ratings      DISABLE ROW LEVEL SECURITY;
ALTER TABLE announcements DISABLE ROW LEVEL SECURITY;
ALTER TABLE lessons      DISABLE ROW LEVEL SECURITY;
