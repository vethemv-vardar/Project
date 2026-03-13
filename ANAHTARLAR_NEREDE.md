# Supabase anahtarları — hangisi nereye?

Senin verdiğin iki anahtar:

| # | Anahtar (ilk kısım) | Rol | Kullanım |
|---|---------------------|-----|----------|
| **1** | `eyJ...bXScXHfyfLH0YSVAWX4mHcLzcLUPjgIoPywCdWZDNt4` | **anon** | Backend'de kullanma. Sadece tarayıcı/public için. |
| **2** | `eyJ...vR5jinPWdhDjnk7CPsvjalWTCcV_SnuoNEaQ20duKbY` | **service_role** | Backend için bu. Railway'de **SUPABASE_SERVICE_KEY** olarak koy. |

---

## Nereye koyacaksın?

- **SUPABASE_URL:** `https://pcxfrnphbhslgpzspscs.supabase.co`  
  → Railway Variables: `SUPABASE_URL`  
  → Yerel: `.env` içinde (zaten var).

- **SUPABASE_SERVICE_KEY:** Yukarıdaki **2. anahtar** (service_role).  
  → Railway Variables: `SUPABASE_SERVICE_KEY`  
  → Yerel: `.env` içinde (zaten var).

1. anahtar (anon) hiçbir yere yazma; backend için kullanılmaz.

**.env** dosyası git’e gönderilmez (.gitignore’da). Railway’e deploy ederken aynı URL ve **2. anahtarı** Railway Variables’a elle ekle.
