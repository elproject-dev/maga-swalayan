# Maga Swalayan - Dokumentasi Sistem, Backup & Restore

Aplikasi web e-commerce & membership Maga Swalayan ([www.swalayanmaga.com](https://www.swalayanmaga.com)).

---

## 🏗️ Arsitektur Sistem

- **Frontend:** Next.js (App Router, Tailwind CSS, TypeScript) di-hosting di **Vercel** (`https://www.swalayanmaga.com`).
- **Backend / Database / Storage:** Supabase Self-Hosted berjalan di Docker pada **VPS Tencent Cloud** (`https://supabase.swalayanmaga.com`).
- **Autentikasi:** Google OAuth (Client ID `133651903689-0sc5gje66rgfr20jug7is8lohhb74r5b.apps.googleusercontent.com`).
- **Automated Backup:** Rclone terintegrasi dengan Google Drive folder [Backup Maga Swalayan](https://drive.google.com/drive/folders/1woZACtEaVzZhewmFtRTJnM6SKeaafmVr).
- **Jadwal Backup Otomatis:** Setiap hari pukul **02:00 pagi** via Linux Cron Job di VPS.

---

## 📂 Struktur File Backup di Google Drive

Setiap kali backup berjalan, ada 2 jenis file yang diunggah ke Google Drive:

1. **`magaswalayan_db_YYYYMMDD_HHMMSS.sql.gz`**
   - Dump lengkap seluruh skema dan isi tabel database PostgreSQL (tabel `pelanggan`, `poin_transactions`, `staf`, `produk`, `promo`, `banner`, dll).
   - Format: SQL teks yang dikompresi dengan Gzip.

2. **`magaswalayan_media_YYYYMMDD_HHMMSS.tar.gz`**
   - Arsip seluruh file aset gambar/media (banner, produk, lokasi, promo) dari direktori storage Supabase `/opt/supabase/docker/volumes/storage/`.
   - Format: Arsip Tar yang dikompresi dengan Gzip.

> **Catatan:** Google Drive web menampilkan keterangan *unknown / no preview* karena kedua file di atas adalah arsip server terkompresi. Ini wajar. Jika diekstrak di laptop (Mac/Windows), file akan terbuka normal.

---

## 🚀 Panduan Restore (Pemulihan Data)

Jika terjadi kendala pada server, data tidak sengaja terhapus, atau server dipindahkan ke VPS baru, ikuti panduan di bawah ini.

### Skenario 1: Restore Database PostgreSQL

Jalankan perintah ini di terminal VPS (`root@43.173.41.249`):

#### 1. Download file backup database dari Google Drive
Ganti nama file dengan tanggal backup yang ingin Anda gunakan:
```bash
rclone copy gdrive:magaswalayan_db_20261116_220059.sql.gz /tmp/
```

#### 2. Jalankan perintah restore ke database Supabase
```bash
gunzip -c /tmp/magaswalayan_db_20261116_220059.sql.gz | docker exec -i supabase-db psql -U postgres -d postgres
```

> **Selesai!** Database akan langsung pulih ke kondisi pada tanggal dan jam backup tersebut dibuat.

---

### Skenario 2: Restore Media Storage (Gambar Produk, Banner, dll)

#### 1. Download file backup media dari Google Drive
```bash
rclone copy gdrive:magaswalayan_media_20261116_220059.tar.gz /tmp/
```

#### 2. Ekstrak langsung ke folder volume Supabase Storage
```bash
tar -xzf /tmp/magaswalayan_media_20261116_220059.tar.gz -C /opt/supabase/docker/volumes/storage/
```

#### 3. Sesuaikan hak akses file (permission)
```bash
chown -R 1000:1000 /opt/supabase/docker/volumes/storage/
```

> **Selesai!** Seluruh gambar produk, banner promo, dan aset media langsung aktif kembali di website.

---

### Skenario 3: Restore Full di Server VPS Baru (Disaster Recovery)

Jika suatu saat VPS lama diganti atau di-reinstall dari nol:

1. **Setup Docker & Git di VPS Baru:**
   ```bash
   apt update && apt install -y docker.io docker-compose git rclone nginx certbot python3-certbot-nginx
   ```

2. **Clone repositori Supabase Docker:**
   ```bash
   git clone --depth 1 https://github.com/supabase/supabase /opt/supabase
   cd /opt/supabase/docker
   cp .env.example .env
   # Masukkan konfigurasi password, jwt, dan URL supabase.swalayanmaga.com
   docker compose up -d
   ```

3. **Konfigurasi Rclone Google Drive:**
   Buat file `/root/.config/rclone/rclone.conf` dan masukkan token Google Drive Anda.

4. **Restore Database & Media:**
   Ikuti langkah pada **Skenario 1** dan **Skenario 2** di atas.

5. **Nginx & SSL:**
   Konfigurasi reverse proxy Nginx mengarah ke `http://127.0.0.1:8000` dan aktifkan SSL dengan:
   ```bash
   certbot --nginx -d supabase.swalayanmaga.com
   ```

---

## 🛠️ Perintah Berguna di VPS

- **Menjalankan Backup Manual:**
  ```bash
  /bin/bash /root/backup_to_gdrive.sh
  ```
- **Melihat Status Container Supabase:**
  ```bash
  cd /opt/supabase/docker && docker compose ps
  ```
- **Melihat Log Database:**
  ```bash
  docker logs -f supabase-db --tail 100
  ```
- **Melihat Daftar File Backup di Google Drive dari VPS:**
  ```bash
  rclone ls gdrive:
  ```

---

## 💻 Pengembangan Lokal (Frontend)

```bash
# Install dependencies
pnpm install

# Jalankan development server
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat website secara lokal.
