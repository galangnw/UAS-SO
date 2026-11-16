# ARSITEKTUR & ALUR DATA — Kernel Clash Arcade

Dokumen panduan ringkas alur kerja sistem untuk tim.

---

## 1. MAPPING ALUR KONEKSI

```
[ Frontend A ]                        [ Frontend B ]
 Guest + Buat/Gabung Room               Isi Halaman Room
 (REST saja)                            (Socket.io saja)
      │                                      │
      └──────────────┬───────────────────────┘
                     ▼
        [ Express + Socket.io — Port 3000 ]
                     │
                     ▼
        [ Supabase PostgreSQL — PgBouncer 6543 ]
```

| Bagian | Pemilik | Teknologi |
|---|---|---|
| Guest auth, buat room, gabung room | Frontend A | REST (fetch/axios) |
| Ruang tunggu, siap, kick, mulai turnamen | Frontend B | Socket.io |
| Data & validasi | Backend | Express + pg |

> Keduanya bekerja di **satu repo, satu aplikasi**. B tidak membuat project baru.

---

## 2. ATURAN PENTING ALUR DATA

1. **Header ngrok**: Semua request REST & Socket handshake WAJIB bawa header `ngrok-skip-browser-warning: true`.
2. **Identitas Player (`userId`)**:
   - Lahir saat `POST /api/auth/guest`.
   - Nama & warna avatar **di-generate otomatis** oleh frontend (tanpa layar input) — lihat `SPESIFIKASI_AUTO_NAME.md`.
   - Simpan di `localStorage.setItem('userId', data.userId)`.
   - Dipakai di REST (`POST /api/rooms`) dan Socket handshake (`emit('auth', userId)`).
3. **Pembungkusan Response REST**:
   - Sukses: `{ "success": true, "data": { ... } }` → Frontend ambil dari `res.data`.
   - Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`.
4. **Event Socket.io**:
   - TIDAK dibungkus `success/data`. Direct payload.
5. **Serah terima A → B**:
   - A menyerahkan **kode room** (wajib) + objek room hasil REST (opsional, agar tampilan langsung penuh).
   - B tetap wajib `emit('room:join', { code })`; `room:state` dari server adalah sumber kebenaran.
   - A tidak membuka socket untuk room. Hanya B.

---

## 3. FLOW KEHIDUPAN ROOM

```
[Buat Room / Gabung] ──► [Lobi Room (Waiting)] ──► [Klik Ready (Semua Player)]
                                                               │
                                                               ▼
[Selesai Semua Minigame] ◄── [Main Minigame] ◄── [Host Klik Mulai Tournament]
```

> Jumlah & tema minigame **belum final** (minigame 2 dan 3 masih dibahas).
> Alur di atas tidak berubah berapa pun jumlah minigame-nya.

- **Host Keluar di Lobi**: Room otomatis dibubarkan (`status = finished`). Player tersisa dapat event `room:disbanded` → balik ke menu utama.
- **Player Disconnect**: Socket bersih-bersih otomatis dalam 20 detik.
