require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Railway'de crash olmasın: env kontrolü
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('HATA: SUPABASE_URL ve SUPABASE_SERVICE_KEY tanımlı olmalı. Railway > Variables ekle.');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// ─── SUPABASE BAĞLANTISI ────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ─── SABITLER ───────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET  || 'fallback_secret';
const ADMIN_CODE = process.env.ADMIN_CODE  || '0000';
const CODE_SALT  = process.env.CODE_SALT   || 'DA2025';
const PORT       = process.env.PORT        || 3000;

// ─── YARDIMCILAR ────────────────────────────────────────────

// Her ay + grup için 4 haneli deterministik kod üret
function generateMonthlyCode(groupName, monthKey) {
  const seed = `${CODE_SALT}-${groupName}-${monthKey}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) + hash) ^ seed.charCodeAt(i);
    hash = hash >>> 0; // unsigned 32bit
  }
  // 4 haneli sayısal kod: 1000-9999 arası
  const code = 1000 + (hash % 9000);
  return String(code);
}

function getCurrentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getPrevMonthKey() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// JWT doğrulama middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token gerekli' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
  }
}

// Admin middleware
function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin yetkisi gerekli' });
  next();
}

// ─── SAĞLIK KONTROLÜ ────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'DriveAcademy Backend çalışıyor 🚗', time: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════

// Admin girişi — 4 haneli sabit kod
app.post('/auth/admin', (req, res) => {
  const { code } = req.body;
  if (!code || String(code).trim() !== String(ADMIN_CODE).trim()) {
    return res.status(401).json({ error: 'Admin kodu hatalı' });
  }
  const token = jwt.sign({ role: 'admin', name: 'Admin' }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, role: 'admin', name: 'Admin' });
});

// Öğrenci girişi — sadece aylık 4 haneli kod (anonim)
app.post('/auth/student', async (req, res) => {
  const { monthly_code } = req.body;
  if (!monthly_code) {
    return res.status(400).json({ error: 'Aylık kod gerekli' });
  }

  const mk     = getCurrentMonthKey();
  const prevMk = getPrevMonthKey();

  // Tüm öğrenciler için B grubu kabul ediliyor (anonim)
  const validNow  = generateMonthlyCode('B', mk);
  const validPrev = generateMonthlyCode('B', prevMk);
  const entered   = String(monthly_code).trim();

  if (entered !== validNow && entered !== validPrev) {
    return res.status(401).json({ error: 'Aylık giriş kodu hatalı veya süresi dolmuş' });
  }

  const token = jwt.sign(
    { role: 'student', group: 'B' },
    JWT_SECRET,
    { expiresIn: '35d' }
  );

  res.json({
    token,
    role:  'student',
    group: 'B',
  });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN — Öğrenci Yönetimi
// ═══════════════════════════════════════════════════════════

// Tüm öğrencileri listele
app.get('/admin/students', auth, adminOnly, async (req, res) => {
  const { data, error } = await supabase.from('students').select('*').order('name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Yeni öğrenci ekle
app.post('/admin/students', auth, adminOnly, async (req, res) => {
  const { username, name, tc, group_name, lessons_completed, total_lessons } = req.body;
  if (!username || !name || !tc) return res.status(400).json({ error: 'Eksik bilgi' });

  const { data, error } = await supabase.from('students').insert({
    username: username.trim().toLowerCase(),
    name: name.trim(),
    tc: tc.trim(),
    group_name: group_name || 'B',
    lessons_completed: lessons_completed || 0,
    total_lessons: total_lessons || 40,
  }).select().single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Öğrenci güncelle
app.put('/admin/students/:id', auth, adminOnly, async (req, res) => {
  const { name, tc, group_name, lessons_completed, total_lessons } = req.body;
  const { data, error } = await supabase
    .from('students')
    .update({ name, tc, group_name, lessons_completed, total_lessons })
    .eq('id', req.params.id)
    .select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// Öğrenci sil
app.delete('/admin/students/:id', auth, adminOnly, async (req, res) => {
  const { error } = await supabase.from('students').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN — Aylık Kodlar
// ═══════════════════════════════════════════════════════════

// Bu ayın tüm grup kodlarını getir
app.get('/admin/monthly-codes', auth, adminOnly, (req, res) => {
  const mk     = getCurrentMonthKey();
  const groups = ['A1','A2','B','C','D','E'];
  const codes  = groups.map(g => ({
    group: g,
    month: mk,
    code:  generateMonthlyCode(g, mk),
  }));
  res.json({ month: mk, codes });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN — Duyuru Yönetimi
// ═══════════════════════════════════════════════════════════

app.post('/admin/announcements', auth, adminOnly, async (req, res) => {
  const { icon, title, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Eksik bilgi' });
  const { data, error } = await supabase
    .from('announcements').insert({ icon: icon || '📢', title, body }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/admin/announcements/:id', auth, adminOnly, async (req, res) => {
  const { error } = await supabase.from('announcements').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN — Ders Yönetimi
// ═══════════════════════════════════════════════════════════

app.post('/admin/lessons', auth, adminOnly, async (req, res) => {
  const { title, instructor, vehicle, lesson_date, duration, location, address, status, note } = req.body;
  const { data, error } = await supabase.from('lessons')
    .insert({ title, instructor, vehicle, lesson_date, duration, location, address, status, note })
    .select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/admin/lessons/:id', auth, adminOnly, async (req, res) => {
  const { data, error } = await supabase.from('lessons')
    .update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/admin/lessons/:id', auth, adminOnly, async (req, res) => {
  const { error } = await supabase.from('lessons').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════
//  ÖĞRENCI — Genel Veriler
// ═══════════════════════════════════════════════════════════

// Duyurular
app.get('/announcements', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('announcements').select('*').order('created_at', { ascending: false }).limit(10);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Dersler
app.get('/lessons', auth, async (req, res) => {
  const { data, error } = await supabase
    .from('lessons').select('*').order('id');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ═══════════════════════════════════════════════════════════
//  PUANLAMA
// ═══════════════════════════════════════════════════════════

// Hoca puan ver (cihaz başına, ayda 1 kez, anonim)
app.post('/ratings', async (req, res) => {
  const { instructor_id, star, comment, device_token } = req.body;

  if (!instructor_id || !star) {
    return res.status(400).json({ error: 'Eksik bilgi' });
  }
  if (!device_token) {
    return res.status(400).json({ error: 'Cihaz kimliği (device_token) gerekli' });
  }
  if (star < 1 || star > 5) {
    return res.status(400).json({ error: 'Puan 1-5 arasında olmalı' });
  }

  const mk = getCurrentMonthKey();

  // Bu cihaz bu hocayı bu ay zaten oylamış mı?
  const { data: existing, error: findErr } = await supabase
    .from('ratings')
    .select('id')
    .eq('instructor_id', instructor_id)
    .eq('month_key', mk)
    .eq('device_token', device_token)
    .maybeSingle();

  if (findErr) {
    return res.status(500).json({ error: findErr.message });
  }
  if (existing) {
    return res.status(409).json({ error: 'Bu ay bu hocayı zaten oyladınız' });
  }

  const { data, error } = await supabase.from('ratings').insert({
    student_id:    null,
    instructor_id: parseInt(instructor_id),
    month_key:     mk,
    star:          parseInt(star),
    comment:       comment || '',
    device_token,
  }).select().single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

// Admin: tüm puanları gör + hoca ortalamaları
app.get('/admin/ratings', auth, adminOnly, async (req, res) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*, students(name, username)')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });

  // Hoca bazlı ortalama hesapla
  const avgMap = {};
  data.forEach(r => {
    if (!avgMap[r.instructor_id]) avgMap[r.instructor_id] = { total:0, count:0 };
    avgMap[r.instructor_id].total += r.star;
    avgMap[r.instructor_id].count += 1;
  });
  const averages = Object.entries(avgMap).map(([id, v]) => ({
    instructor_id: parseInt(id),
    average: (v.total / v.count).toFixed(1),
    count: v.count,
  }));

  res.json({ ratings: data, averages });
});

// ─── BAŞLAT ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ DriveAcademy Backend çalışıyor → http://localhost:${PORT}`);
  console.log(`📅 Ay kodu örneği (B grubu): ${generateMonthlyCode('B', getCurrentMonthKey())}`);
});
