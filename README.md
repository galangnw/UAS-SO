# Kernel Clash Arcade

Game edukasi Sistem Operasi berbasis multiplayer untuk 4 pemain. Pemain masuk ke satu lobby, lalu bermain dua minigame yang mengilustrasikan konsep race condition, mutex, semaphore, deadlock, resource ordering, dan Banker's Algorithm. Seluruh aturan dan penilaian dijalankan oleh backend secara real-time melalui Socket.IO.

## Deskripsi Game

### Game 1 — Stick Brawl

Tiga ronde dengan mekanisme berbeda:

| Ronde | Mekanisme | Gambaran |
|---|---|---|
| 1 | Tanpa Aturan / Race Condition | Semua pemain bebas berebut piala di tengah ring. Tabrakan memicu BOOM. |
| 2 | Mutex | Hanya satu pemain yang boleh memegang kunci gerbang pada satu waktu. |
| 3 | Semaphore | Dua slot kunci tersedia sehingga dua pemain boleh masuk bersamaan. |

Pemain menekan tombol **PUKUL!** ketika berada di zona ring. Setiap aksi penting dicatat di panel **Log Kejadian** dengan nomor langkah, sehingga alur persaingan bisa ditelusuri. Host dapat mengatur durasi ronde sebelum permainan dimulai.

### Game 2 — Deadlock Dungeon / Resource Ordering

Tiga ronde dengan skenario peta yang sama:

| Ronde | Algoritma | Gambaran |
|---|---|---|
| 1 | No Prevention | Circular wait bisa terjadi dan menghasilkan deadlock. |
| 2 | Resource Ordering | Resource diambil berdasarkan urutan tertentu untuk mencegah deadlock. |
| 3 | Banker's Algorithm | Server mensimulasikan pemberian resource hanya jika keadaan masih aman. |

Setiap pemain harus menangkap 6 ubur-ubur sesuai angka di panelnya, lalu lari ke pintu **EXIT**. Tombol **LEPAS** melepas semua resource yang sedang dipegang. Saat deadlock terjadi, menekan LEPAS mempercepat pelepasan; semua pemain yang terlibat tetap mendapat penalti deadlock.

### Fitur Utama

- Lobby real-time untuk tepat 4 pemain dengan sistem **SIAP** untuk tamu.
- Host memegang kendali transisi antar ronde dan antar game.
- Skor akhir merupakan gabungan skor Game 1 dan Game 2.
- Tabel perbandingan metrik berasal dari data simulasi backend, bukan nilai statis.
- Visualisasi langkah melalui Log Kejadian bernomor langkah pada Game 1.
- REST API dan Socket.io berjalan pada satu origin yang sama.

## Teknologi

- Frontend: React, Vite, Tailwind CSS, Socket.IO client
- Backend: Node.js, Express, Socket.IO, PostgreSQL
- Database: Supabase melalui PgBouncer port `6543`
- Deploy: Vercel untuk frontend, Heroku untuk backend

## Instalasi

### Prasyarat

- Node.js 20 atau lebih baru
- npm
- Backend project sudah berjalan di `http://localhost:3000`
- Database Supabase sudah terpasang dan skema sudah dijalankan

### Langkah

1. Masuk ke folder frontend:

   ```powershell
   cd C:\latihan\projectakhirso\Frontend_SistemOperasi
   ```

2. Pasang dependency:

   ```powershell
   npm install
   ```

3. Buat file `.env` di folder frontend:

   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_SOCKET_URL=http://localhost:3000
   ```

4. Jalankan aplikasi:

   ```powershell
   npm run dev
   ```

5. Buka browser di:

   ```text
   http://localhost:5173
   ```

### Build Produksi

```powershell
npm run build
npm run preview
```

Hasil build ada di folder `dist/`.

## Cara Penggunaan

1. Buka halaman utama dan masukkan nama tamu. Nama akan mengikuti warna kursi yang diberikan server: Merah, Hijau, Biru, atau Kuning.
2. Host membuat room; pemain lain memasukkan kode room yang diberikan host.
3. Lobby harus berisi tepat 4 pemain. Semua tamu menekan **SIAP**, baru host bisa menekan **MULAI**.
4. Pada Game 1, host mengatur durasi ronde. Setelah itu pemain mengikuti popup aturan ronde lalu masuk ke arena.
5. Gunakan tombol **PUKUL!** untuk menyerang. Perhatikan Log Kejadian untuk melihat urutan langkah dan kondisi gate.
6. Setelah hasil pertandingan tampil, host menekan **LANJUT KE GAME 2**. Pemain lain menunggu host.
7. Pada Game 2, gunakan joystick atau tombol panah untuk bergerak. Kumpulkan resource sesuai angka di panel, lalu menuju **EXIT**.
8. Tekan **LEPAS** jika ingin melepas resource yang sedang dipegang.
9. Host melanjutkan ke ronde berikutnya lewat tombol pada layar briefing.
10. Di akhir, semua pemain melihat rekap skor gabungan kedua game. Tombol **Kembali Ke Lobby** membawa pemain ke room yang sama, sedangkan **Main Lagi** mengulang turnamen dari Game 1.

### Catatan Untuk 4 Pemain di Satu Komputer

localStorage tiap browser bersifat terpisah. Gunakan kombinasi berikut agar 4 pemain terdeteksi sebagai 4 user berbeda:

- Google Chrome biasa
- Google Chrome Incognito
- Microsoft Edge
- Mozilla Firefox

Mengganti akun Google di dalam profil Chrome yang sama tidak memisahkan localStorage.

## Konfigurasi Deploy

### Production

| Item | Nilai |
|---|---|
| Project Vercel | `uas-so` |
| Branch deploy | `prod` (auto-deploy aktif) |
| URL frontend | `https://kernelclash.jnpdev.tech` |
| App Heroku | `kernel-clash-api` |
| Repo backend | `januardineky/Back-End_SisOp`, branch `prod` (auto-deploy aktif) |
| URL API | `https://kernelclashapi.jnpdev.tech` |

### Backend di Heroku

Config Vars yang dibutuhkan:

```text
NODE_ENV=production
CLIENT_URL=https://kernelclash.jnpdev.tech
DATABASE_URL=postgresql://<user>:<password>@<host-pooler>:6543/postgres
```

`CLIENT_URL` harus sama persis dengan origin frontend yang dibuka pemain. Backend berjalan di Basic dyno `web.1` dengan SSL aktif melalui Heroku ACM. Nilai Config Vars di dashboard ditulis tanpa tanda kutip. Heroku menyediakan `PORT` otomatis, sehingga tidak perlu ditambahkan.

### Frontend di Vercel

Environment variables yang dibutuhkan:

```env
VITE_API_BASE_URL=https://kernelclashapi.jnpdev.tech/api
VITE_SOCKET_URL=https://kernelclashapi.jnpdev.tech
```

Kode frontend tidak pernah menuliskan URL ini secara literal. `src/lib/api.js` memakai `import.meta.env.VITE_API_BASE_URL`, dan `src/lib/socket.js` memakai `import.meta.env.VITE_SOCKET_URL`. File `.env` lokal hanya untuk development dan tidak ikut ke repository.

| Fungsi | Domain |
|---|---|
| Frontend | `kernelclash.jnpdev.tech` |
| Backend | `kernelclashapi.jnpdev.tech` |

Keduanya memakai SSL. Variabel `VITE_` dibaca saat build, sehingga frontend perlu di-deploy ulang setelah env diubah.

## Anggota Tim

| Nama | NIM | Peran |
|---|---|---|
|  |  |  |
|  |  |  |
|  |  |  |
|  |  |  |
