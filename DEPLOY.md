# DriveAcademy — Nereyi Nereye Koyacağın (Tam Detay)

Aşağıda her değeri **nereden alacağın** ve **tam olarak nereye yazacağın** adım adım yazıyor.

---

# BÖLÜM 1 — SUPABASE (Veritabanı)

## Adım 1.1 — Proje oluştur

1. Tarayıcıda **https://supabase.com** aç.
2. Giriş yap (veya hesap oluştur).
3. **"New Project"** butonuna tıkla.
4. **Organization** seç (yoksa oluştur).
5. **Name:** Örneğin `driveacademy` yaz.
6. **Database Password:** Güçlü bir şifre oluştur, bir yere not et (veritabanı şifresi).
7. **Region:** Europe (Frankfurt) veya sana yakın bir bölge seç.
8. **Create new project** de. Birkaç dakika bekle.

---

## Adım 1.2 — SQL şemasını çalıştır

1. Supabase projesi açıkken **sol menüden** (soldaki ikonlar):
   - **"SQL Editor"** (veya "Database" altında) tıkla.
2. Sağ üstte **"+ New query"** butonuna tıkla.
3. Bilgisayarındaki bu dosyayı aç:  
   `DriveAcademyBackend\DriveAcademyBackend\supabase_schema.sql`
4. **Dosyanın tamamını** kopyala (Ctrl+A, Ctrl+C).
5. Supabase’deki **büyük metin kutusuna** (boş sorgu alanına) yapıştır (Ctrl+V).
6. Sağ altta **"Run"** (veya Ctrl+Enter) tıkla.
7. **"Success. No rows returned"** yazıyorsa her şey doğru çalışmış demektir. CREATE TABLE ve ALTER TABLE satır döndürmez; bu yüzden "No rows returned" normaldir. Hata olsaydı kırmızı hata mesajı görürdün.
8. Kontrol için: Sol menüden **Table Editor** aç → **students**, **announcements**, **lessons** tablolarını görmelisin; **students** içinde 3 demo kayıt (ahmet123, fatma456, mehmet789) olmalı.

**Not:** Supabase PostgreSQL kullanır (SQLite değil). `supabase_schema.sql` zaten PostgreSQL için; başka yere SQLite kodu yapıştırma.

**Özet:** `supabase_schema.sql` içeriği → Supabase SQL Editor’daki boş sorgu kutusuna → Run.

---

## Adım 1.3 — URL ve anahtarı al (Railway’e koyacağın değerler)

1. Supabase’de **sol menüden** dişli ikona tıkla → **"Project Settings"** (veya "Settings").
2. Sol tarafta **"API"** sekmesine gir.
3. Sayfada şunları göreceksin:

   **A) Project URL**
   - Başlık: **"Project URL"** veya **"API URL"**.
   - Altında bir link var, örneğin:  
     `https://abcdefghijk.supabase.co`
   - Bu **tüm linki** kopyala (https ile biter).  
   - **Nereye koyacaksın:** Bölüm 2’de Railway’de `SUPABASE_URL` değişkeninin değeri olacak.

   **B) Project API keys**
   - **"anon"** ve **"service_role"** iki anahtar var.
   - **Sadece "service_role"** satırındaki anahtarı kullan. (anon değil!)
   - **"Reveal"** / **"Copy"** ile göster ve kopyala. Uzun bir metin, `eyJ...` ile başlar.
   - Bu değeri **nereye koyacaksın:** Bölüm 2’de Railway’de `SUPABASE_SERVICE_KEY` değişkeninin değeri olacak.

**Özet:**
- Supabase **Settings → API** → **Project URL** → kopyala → Railway’de **SUPABASE_URL**.
- Supabase **Settings → API** → **service_role** key → kopyala → Railway’de **SUPABASE_SERVICE_KEY**.

---

# BÖLÜM 2 — RAILWAY (Backend sunucusu)

## Adım 2.1 — Backend’i GitHub’a at

1. **GitHub.com**’da giriş yap.
2. **"New repository"** (yeni depo) oluştur. İsim örn: `DriveAcademyBackend`.
3. Bilgisayarında **DriveAcademyBackend** klasörünü aç (içinde `server.js`, `package.json`, `supabase_schema.sql` olan klasör).
4. Bu klasörü GitHub’a yükle:
   - Ya **GitHub Desktop** ile bu klasörü seçip "Publish repository" de,
   - Ya da komut satırında:
     ```bash
     cd DriveAcademyBackend
     git init
     git add .
     git commit -m "Initial commit"
     git branch -M main
     git remote add origin https://github.com/KULLANICI_ADIN/DriveAcademyBackend.git
     git push -u origin main
     ```
     (KULLANICI_ADIN yerine kendi GitHub kullanıcı adın, repo adı ne verdinse o.)

**Özet:** `DriveAcademyBackend` klasörü (server.js’in olduğu) → GitHub’da bir repo’nun içeriği.

---

## Adım 2.2 — Railway’de proje oluştur

1. Tarayıcıda **https://railway.app** aç.
2. **"Login"** → **"Login with GitHub"** de, GitHub ile giriş yap.
3. **"New Project"** tıkla.
4. **"Deploy from GitHub repo"** seçeneğini seç.
5. Repo listesinden **DriveAcademyBackend** (az önce yüklediğin repo) seç.
6. Railway repoyu bağlar ve deploy etmeye başlar. İlk deploy bir süre sürebilir.

**Özet:** Railway’de yeni proje → GitHub’dan **DriveAcademyBackend** repoyu seç.

---

## Adım 2.3 — Railway’e değişkenleri (Variables) ekle

1. Railway’de projen açık. Açılan ekranda **servis/kutu** (DriveAcademyBackend) görünür. Üstüne tıkla.
2. Üstte sekmeler var: **Deployments**, **Variables**, **Settings** vb. **"Variables"** sekmesine tıkla.
3. **"Add Variable"** veya **"New Variable"** / **"RAW Editor"** gibi bir buton göreceksin.  
   Bazen **Variable name** ve **Value** yan yana iki kutu da olur.
4. Aşağıdaki **her satırı tek tek** ekle. **Sol taraf = değişken adı (tam yazı), sağ taraf = değer.**

| Sol kutu (Variable / Name) | Sağ kutu (Value) — ne yazacaksın |
|----------------------------|-----------------------------------|
| `SUPABASE_URL` | Supabase’den kopyaladığın **Project URL** (örn. `https://abcdefghijk.supabase.co`) — tırnak yok, tek satır. |
| `SUPABASE_SERVICE_KEY` | Supabase’den kopyaladığın **service_role** anahtarı (uzun, `eyJ...` ile başlayan) — tırnak yok. |
| `JWT_SECRET` | Kendi uydurduğun uzun bir şifre. Örn: `DriveAcademy2025GizliAnahtar!` — kimseyle paylaşma. |
| `ADMIN_CODE` | Tam olarak: `9999` (admin girişte bu kodu gireceksin). |
| `CODE_SALT` | Tam olarak: `KURSADI2025` (kurs adına göre değiştirebilirsin; sonra değiştirirsen eski aylık kodlar tutarsız olur). |

- Değerlerde **boşluk bırakma** (sadece değerin kendisi). Tırnak koyma.
- Hepsi eklendikten sonra Railway genelde otomatik yeniden deploy eder. Bekle.

**Özet:**  
Supabase’deki **Project URL** → Railway Variables’ta **SUPABASE_URL**.  
Supabase’deki **service_role** key → Railway Variables’ta **SUPABASE_SERVICE_KEY**.  
Kalan üçü yukarıdaki tabloda yazdığı gibi.

---

## Adım 2.4 — Railway URL’ini bul ve kopyala

1. Railway’de yine proje/servis ekranındasın. **"Settings"** sekmesine gir.
2. **"Networking"** veya **"Public Networking"** bölümüne bak.
3. **"Generate Domain"** / **"Add Domain"** varsa tıkla; Railway otomatik bir adres verir.
4. Verilen adres şuna benzer:  
   `https://driveacademybackend-production-xxxx.up.railway.app`  
   veya  
   `https://xxxx.up.railway.app`
5. Bu **tüm adresi** (https ile) kopyala.  
   **Nereye koyacaksın:** Bölüm 3’te DriveAcademy uygulamasındaki `api.js` dosyasında `API_URL` satırına.

**Özet:** Railway **Settings → Networking** → oluşan **https://...railway.app** linki → kopyala → bir sonraki bölümde api.js’e yapıştıracağız.

---

# BÖLÜM 3 — UYGULAMAYI BAĞLA (DriveAcademy)

## Adım 3.1 — api.js dosyasını bul ve aç

1. Bilgisayarında **DriveAcademy** projesinin klasörünü aç (React Native/Expo projesi; içinde `App.js`, `src` klasörü var).
2. Şu dosyaya git:  
   `DriveAcademy\src\utils\api.js`  
   (Bazen proje adı farklı olabilir, örn. `DriveAcademy_v3\DriveAcademy\src\utils\api.js` — `src/utils/api.js` yolunu bul.)
3. Dosyayı bir metin editörü veya Cursor/VS Code ile aç.

**Özet:** Açılacak dosya: proje içinde **src/utils/api.js**.

---

## Adım 3.2 — API URL satırını değiştir

1. `api.js` dosyasının **en üstlerinde** (genelde 3–5. satır civarı) şöyle bir satır var:
   ```js
   export const API_URL = 'https://RAILWAY_URL_BURAYA.railway.app';
   ```
2. Bu satırı şöyle değiştir:
   - `RAILWAY_URL_BURAYA` yazan yeri **tamamen sil**.
   - Yerine **Railway’den kopyaladığın adresi** yapıştır, **ama sadece domain kısmı**:
     - Railway’de verilen: `https://driveacademybackend-production-abc12.up.railway.app`
     - Burada kullanacağın: `driveacademybackend-production-abc12.up.railway.app` (https:// olmadan, sondaki .railway.app kalabilir veya Railway’de ne verildiyse o).
   - Yani satır şöyle olmalı (kendi Railway adresinle):
     ```js
     export const API_URL = 'https://driveacademybackend-production-abc12.up.railway.app';
     ```
     Kendi URL’inde `https://` yoksa başa ekle; zaten varsa olduğu gibi bırak. Sonuç mutlaka `https://...` ile başlamalı.

3. Dosyayı **kaydet** (Ctrl+S).

**Özet:**  
- **Nereden:** Railway’den kopyaladığın tam adres (https://...railway.app).  
- **Nereye:** `api.js` içinde `export const API_URL = ' ... ';` satırındaki tırnakların arası.  
- Eski: `'https://RAILWAY_URL_BURAYA.railway.app'`  
- Yeni: `'https://senin-railway-adresin.up.railway.app'`

---

## Adım 3.3 — Uygulamayı çalıştır

1. Terminali (PowerShell veya CMD) aç.
2. **DriveAcademy** proje klasörüne gir:
   ```bash
   cd C:\Users\Administrator\Downloads\files\DriveAcademy_v3\DriveAcademy
   ```
   (Kendi proje yoluna göre `cd ...` ile o klasöre geç.)
3. Şu komutu çalıştır:
   ```bash
   npx expo start
   ```
4. QR kodu telefonla tara veya emülatörde aç. Uygulama artık backend’e Railway üzerinden bağlanır.

**Özet:** Proje klasöründe `npx expo start` → uygulama açılır, API istekleri Railway URL’ine gider.

---

# ÖZET TABLO — Nereyi nereye koydum?

| Ne? | Nereden alıyorsun? | Nereye koyuyorsun? |
|-----|---------------------|---------------------|
| SQL şeması | `DriveAcademyBackend\DriveAcademyBackend\supabase_schema.sql` dosyası | Supabase → SQL Editor → New query kutusu → Run |
| Project URL | Supabase → Settings → API → **Project URL** | Railway → Variables → **SUPABASE_URL** |
| service_role key | Supabase → Settings → API → **service_role** (Reveal/Copy) | Railway → Variables → **SUPABASE_SERVICE_KEY** |
| JWT_SECRET | Kendin uydur (uzun şifre) | Railway → Variables → **JWT_SECRET** |
| ADMIN_CODE | Sabit: `9999` | Railway → Variables → **ADMIN_CODE** |
| CODE_SALT | Sabit: `KURSADI2025` | Railway → Variables → **CODE_SALT** |
| Railway URL | Railway → Settings → Networking → verilen domain (https://...railway.app) | DriveAcademy **src/utils/api.js** → `API_URL = '...'` satırının tırnak içi |

---

# Giriş nasıl çalışır?

- **Admin:** Uygulamada sadece **4 haneli kodu** gir: `9999` (Railway’de `ADMIN_CODE` ne yazdıysan o).
- **Öğrenci:** **Kullanıcı adı** (örn. `ahmet123`) + **o aya ait 4 haneli kod**. Aylık kodları admin panelinde “Aylık kodlar” kısmından görebilirsin; öğrencilerle paylaşırsın. Ay değişince kodlar otomatik değişir.

Bu adımları takip edersen her şeyi doğru yere koymuş olursun. Takıldığın bir adım olursa hangi bölüm ve adım olduğunu yaz, oraya göre netleştirebiliriz.
