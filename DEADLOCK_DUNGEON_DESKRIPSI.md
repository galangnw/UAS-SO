# Deadlock Dungeon — Dokumentasi Game (Versi Online)

> Bagian dari **Kernel Clash Arcade** — Minigame 1, modul **Deadlock**
> Terakhir diperbarui: 22 November 2026
> Revisi 22 Nov 2026: meluruskan posisi seed, menyelaraskan daftar input, dan merangkum keputusan yang masih tertunda.
>
> Versi standalone lama disimpan di `DEADLOCK_DUNGEON_DESKRIPSI_v1_standalone.md`.
> Dokumen ini adalah acuan untuk versi online (React + Express + Socket.io).

**Legenda status:** ✅ = sudah disepakati dan dipakai sebagai acuan; 🔁 = tombol reproduksi skenario, bukan input perilaku. Semua keputusan sudah final per 22 November 2026.

## 0. Status Terkini (22 Nov 2026)

✅ **Semua keputusan sudah final.** Tujuh poin yang dulu terbuka sudah kamu tentukan:

| # | Keputusan | Hasil akhir |
|---|---|---|
| 1 | Input host | Hanya **durasi**; resource 12 & kebutuhan 6 dikunci |
| 2 | Tempat metrik | `minigame_scores.metrics` (JSONB) per pemain |
| 3 | Visualisasi | **Log berstruktur + satu tabel kecil Banker** |
| 4 | Pemain < 4 | Tidak bisa mulai; tombol host disabled |
| 5 | Mode cepat | Tidak dipakai; selalu 3 ronde |
| 6 | Otoritas gerakan | **Sinkronisasi sederhana**; alokasi/deadlock/skor tetap di server |
| 7 | Metrik ronde | **Agregasi** dari baris per pemain, tanpa tabel baru |

Aturan mulai "tepat 4 pemain" sudah disamakan dengan implementasi teman kamu dan **sudah direvisi** di `lobby.handler.ts`, `rooms.service.ts`, `API_CONTRACT_LOBBY_ROOM.md`, `KONTEKS_APLIKASI_KERNEL_CLASH_ARCADE.md`, dan `REVISI_FRONTEND.md`.

---

## 1. Ringkasan

| Aspek | Detail |
|---|---|
| Topik OS | Deadlock & Resource Allocation |
| Posisi | Minigame 1 dari 3 dalam turnamen |
| Pemain | 4 pemain manusia dalam satu room |
| Format | 3 ronde berurutan, satu algoritma per ronde |
| Skenario | Sama untuk ketiga ronde (peta, misi, spawn, durasi) |
| Resource | R1–R12, tiap pemain membutuhkan 6 ✅ |
| Durasi ronde | 30 detik ✅ |
| Otoritas | Server menentukan alokasi, deadlock, dan skor |
| Input host | Hanya durasi ronde |
| Mulai room | Tepat 4 pemain + semua tamu ready |
| Bot | Tidak dipakai (room wajib 4 pemain) |

---

## 2. Status Keputusan (Ringkas)

### ✅ Sudah disepakati

- Tiga algoritma: No Prevention, Resource Ordering, Banker's Algorithm.
- Deadlock Dungeon dimainkan dalam **3 ronde**, satu algoritma per ronde.
- Ketiga ronde memakai **skenario yang sama**.
- "Skenario" = peta, posisi resource, posisi spawn, misi, durasi, jumlah pemain.
- Skenario **bukan** urutan pemain; game berjalan real-time, tanpa giliran.
- Metrik yang dicatat: deadlock, jumlah selesai, rata-rata waktu, request ditolak.
- Rata-rata waktu dihitung **hanya dari pemain yang selesai**.
- Jumlah pemain yang selesai **wajib ditampilkan** bersama rata-rata waktu.
- Tabel perbandingan algoritma = **1 baris per algoritma**, berisi gabungan semua pemain.
- Perbandingan algoritma memakai data **satu turnamen (3 ronde)**, bukan akumulasi semua pengguna.
- Data semua pengguna hanya untuk leaderboard/statistik global, dipisahkan dari tabel algoritma.
- Pemain yang tidak selesai tidak diberi waktu 0; ditampilkan sebagai `–`.
- Jumlah resource 12 (R1–R12), 6 resource per pemain.
- Durasi ronde 30 detik.
- Peta simetris 4 sudut + resource pertama berbeda tiap pemain.
- Misi baru agar tidak ada dua pemain yang berebut resource nomor terkecil.
- Tidak memakai rotasi posisi antar ronde.
- Skor ketiga ronde dijumlahkan.
- Seed adalah kontrol **reproduksibilitas skenario**, bukan pemenuhan ketentuan "input dapat diubah".
- Input host hanya **durasi ronde**; jumlah resource (12) dan kebutuhan per pemain (6) dikunci.
- Metrik dicatat per ronde di `minigame_scores.metrics` (JSONB), lalu diagregasi — tidak membuat tabel baru.
- Tabel perbandingan algoritma ditampilkan **setelah ronde 3 selesai**, bukan tiap ronde.
- Room hanya bisa mulai dengan **tepat 4 pemain** dan semua pemain selain host sudah `ready`.
- Tidak ada mode cepat: setiap permainan selalu **3 ronde, 3 algoritma**.

### ✅ Keputusan terakhir (22 Nov)

- Visualisasi langkah demi langkah memakai **log berstruktur + satu tabel kecil Banker**.
- Otoritas **gerakan** pemain: **sinkronisasi sederhana**. Alokasi, deteksi deadlock, dan safe state tetap diputuskan server.

---

## 3. Posisi dalam Turnamen

```
TURNAMEN KERNEL CLASH ARCADE
├── Minigame 1: Deadlock Dungeon
│   ├── Ronde 1 — No Prevention
│   ├── Ronde 2 — Resource Ordering
│   └── Ronde 3 — Banker's Algorithm
│       └── Hasil: skor pemain + tabel perbandingan algoritma
├── Minigame 2: belum ditentukan
└── Minigame 3: belum ditentukan
```

Minigame 2 dan 3 **tidak dibahas** di dokumen ini.

---

## 4. Alur Permainan

### 4.1 Dari lobby ke ronde 1

```
Semua pemain ready
      ↓
Host klik "Mulai Turnamen"
      ↓
Server: tournament:starting (countdown 3)
      ↓
Server membuat skenario (seed) dan menyimpannya
      ↓
Ronde 1 dimulai
```

### 4.2 Satu ronde

```
Countdown 3-2-1-GO
      ↓
Main sesuai durasi ronde
      ↓
Ronde berakhir (waktu habis atau semua pemain selesai)
      ↓
Server menghitung metrik ronde
      ↓
Layar hasil ronde (ringkas)
      ↓
Ronde berikutnya
```

### 4.3 Setelah ronde 3

```
Total skor 3 ronde per pemain
      ↓
Tabel perbandingan 3 algoritma
      ↓
Lanjut ke Minigame 2 (placeholder)
```

### 4.4 Aturan ronde

- Peta dan misi **tidak diubah** antar ronde.
- Yang berubah hanya algoritma.
- Countdown penuh hanya di ronde 1; ronde 2 dan 3 cukup 3 detik.
- Skor pemain diakumulasikan lintas ronde ✅.
- Selalu 3 ronde tanpa mode cepat ✅.
- Tombol "Mulai" host disabled sampai jumlah pemain tepat 4 dan semua tamu ready ✅.

---

## 5. Skenario

### 5.1 Definisi

Skenario adalah **kondisi awal arena** yang dibekukan dan dipakai ulang.

| Termasuk skenario | Bukan skenario |
|---|---|
| Posisi R1–R12 | Algoritma yang dipakai |
| Posisi awal tiap pemain | Aksi pemain saat main |
| Daftar resource yang dibutuhkan tiap pemain | Urutan pemain (tidak ada) |
| Durasi ronde | Skor |
| Jumlah pemain | Request diterima/ditolak |
| Seed random | — |

### 5.2 Representasi

```json
{
  "scenarioId": "S-48213",
  "seed": 48213,
  "resourcePositions": { "R1": [2, 3], "R2": [7, 1], "...": [] },
  "spawns": { "P1": [1, 1], "P2": [10, 1], "P3": [1, 8], "P4": [10, 8] },
  "missions": {
    "P1": ["R2", "R3", "R4", "R5", "R6", "R7"],
    "P2": ["R4", "R5", "R6", "R7", "R8", "R9"],
    "P3": ["R7", "R8", "R9", "R10", "R11", "R12"],
    "P4": ["R10", "R11", "R12", "R1", "R2", "R3"]
  },
  "durationSec": 30
}
```

### 5.3 Kenapa harus sama

Kalau peta berubah tiap ronde, perbedaan hasil tidak bisa diatribusikan ke algoritma. Bisa jadi algoritma terlihat lebih baik hanya karena kebetulan mendapat peta yang mudah.

### 5.4 Seed

- Seed dibuat sekali di awal turnamen.
- Ketiga ronde memakai seed yang sama.
- Seed disimpan di metrik agar hasil bisa direproduksi.
- ✅ Seed **tidak dihitung** sebagai input yang dapat diubah; ia hanya mengunci skenario agar perbandingan tetap adil.

---

## 6. Tiga Algoritma

### 6.1 No Prevention — Detection & Recovery

**Aturan:** pemain bebas meminta resource apa saja.

**Mekanisme server:**

1. Setiap permintaan resource diperiksa ketersediaan.
2. Setelah alokasi berhasil, server membangun **wait-for graph**.
3. Server menjalankan deteksi siklus (DFS).
4. Jika ada siklus:
   - Para pemain dalam siklus ditandai `DEADLOCK`.
   - Resource yang mereka pegang dilepas.
   - Pemain berhenti 2 detik (recovery).
   - Metrik `deadlocks` bertambah 1.

**Sifat:** paling fleksibel, paling rawan deadlock.

### 6.2 Resource Ordering — Prevention

**Aturan:** resource harus diambil dalam urutan nomor menaik.

**Mekanisme server:**

1. Server mencatat resource terakhir yang sah dimiliki pemain.
2. Permintaan hanya sah jika nomornya lebih besar dari resource terakhir.
3. Permintaan yang melanggar urutan **ditolak**.
4. Penolakan menambah metrik `rejectedRequests` dan menampilkan umpan balik.

**Sifat:** circular wait tidak mungkin terjadi; fleksibilitas rendah.

### 6.3 Banker's Algorithm — Avoidance

**Aturan:** setiap permintaan disimulasikan dulu terhadap safe state.

**Mekanisme server:**

1. Data yang disimpan: `Max` (misi), `Allocation` (dipegang), `Need` (`Max − Allocation`), `Available`.
2. Permintaan disimulasikan pada salinan state.
3. Jalankan safety algorithm: cari **safe sequence**.
4. Jika safe → alokasi diberikan.
5. Jika unsafe → permintaan ditolak, `rejectedRequests` bertambah.

**Sifat:** fleksibel, aman, tetapi menambah beban komputasi dan penolakan.

### 6.4 Ringkasan

| Algoritma | Pendekatan | Deadlock mungkin? | Biaya |
|---|---|---|---|
| No Prevention | Detection & Recovery | Ya | Recovery 2 detik |
| Resource Ordering | Prevention | Tidak | Kaku |
| Banker | Avoidance | Tidak | Cek safe state tiap request |

---

## 7. Peta, Resource, dan Misi ✅

> Bagian ini sudah disepakati: peta simetris dengan resource pertama berbeda tiap pemain.

### 7.1 Masalah pada versi lama

Misi lama:

| Pemain | Misi lama | Resource pertama |
|---|---|---|
| P1 | R1–R6 | **R1** |
| P2 | R4–R9 | R4 |
| P3 | R7–R12 | R7 |
| P4 | R10–R12, R1–R3 | **R1** |

P1 dan P4 sama-sama wajib merebut R1 lebih dulu di Resource Ordering. Pemain yang spawn dekat R1 menang sejak detik pertama — bukan karena strategi.

### 7.2 Misi yang Dipakai

| Pemain | Misi | Resource pertama |
|---|---|---|
| P1 | R2, R3, R4, R5, R6, R7 | R2 |
| P2 | R4, R5, R6, R7, R8, R9 | R4 |
| P3 | R7, R8, R9, R10, R11, R12 | R7 |
| P4 | R10, R11, R12, R1, R2, R3 | R1 |

Setiap pemain punya resource pertama yang berbeda, sehingga tidak ada perebutan di langkah pertama. Overlap tetap ada di resource berikutnya agar deadlock masih mungkin terjadi.

### 7.3 Peta simetris

- 4 titik spawn di sudut, jarak setara ke pusat.
- Resource pertama tiap pemain diletakkan pada jarak yang sama dari spawn pemiliknya.
- Resource yang dipakai bersama diletakkan di area tengah.

Dengan peta simetris, tidak ada sudut yang lebih beruntung. Keuntungan hanya datang dari kecepatan dan keputusan pemain.

### 7.4 Rotasi posisi

**Tidak dipakai** jika peta sudah simetris. Rotasi hanya diperlukan bila peta tidak simetris, dan itu menambah variabel yang mencampur perbandingan algoritma.

---

## 8. Visualisasi Langkah demi Langkah

### 8.1 Arena

| Elemen | Visual |
|---|---|
| Resource tersedia | Lingkaran terang berlabel R1–R12 |
| Resource terambil | Lingkaran abu-abu + label pemilik `(P1)` |
| Resource dipegang pemain | Teks `[R1, R2]` di atas karakter |
| Deadlock | Aura merah + teks `DEADLOCK!` |
| Recovery | Resource kembali tersedia setelah 2 detik |
| Exit Gate | Lingkaran hijau di tengah |
| Quest HUD | Daftar resource yang masih dibutuhkan |

### 8.2 Panel algoritma

Panel ini yang membedakan "animasi biasa" dari "visualisasi langkah demi langkah".

> ✅ Format final: **log berstruktur + satu tabel kecil Banker**. Tabel Banker menampilkan `Work / Need / Allocation / Finish` dan safe sequence.

| Algoritma | Panel |
|---|---|
| No Prevention | Wait-for graph: `P1 → R2 → P2 → R1 → P1`, siklus disorot |
| Resource Ordering | Urutan sah: `R1 ✓ → R2 ✓ → R4 (menunggu)`; permintaan melanggar ditolak |
| Banker | Tabel `Work / Need / Allocation / Finish`, safe sequence ditampilkan bertahap |

### 8.3 Log kejadian

Setiap kejadian dicatat dengan timestamp:

```
00:03  P1 request R2        → diterima
00:05  P2 request R4        → diterima
00:08  P1 request R4        → menunggu (dipegang P2)
00:09  P2 request R1        → menunggu (dipegang P1)
00:11  SIKLUS TERDETEKSI    → deadlock #1
00:13  Recovery             → R1, R4 dilepas
```

✅ Format final tiap baris: `[jam] [aktor] [aksi] → [hasil] | [state]`. Contoh:

```
00:03  P1     minta R2   → diterima  | pegang=[R2]
00:08  P1     minta R4   → ditolak   | urutan 4 < 2 → invalid
00:11  SISTEM siklus     → deadlock#1 | P1→R2→P2→R1→P1, recovery 2 detik
00:15  BANKER cek P2     → aman      | Work=[1,3,2], safe seq: P2,P4,P1,P3
```

Log ini bisa ditampilkan di panel samping atau di layar hasil ronde.

---

## 9. Input yang Dapat Diubah

### 9.1 Prinsip

Bermain (WASD/klik) membuktikan game interaktif, tetapi **belum tentu** memenuhi ketentuan "input yang dapat diubah". Yang dimaksud biasanya parameter simulasi.

### 9.2 Daftar input

`🔒` = dikunci, tidak bisa diubah host.

| Input | Status | Efek |
|---|---|---|
| Durasi ronde | ✅ | **Satu-satunya** input yang diubah host |
| Jumlah resource | 🔒 | Fix 12 (R1–R12) |
| Jumlah kebutuhan per pemain | 🔒 | Fix 6 per pemain |
| Algoritma per ronde | 🔒 | Fix: R1 No Prevention, R2 Resource Ordering, R3 Banker |
| Seed skenario | 🔁 | Tombol ulang skenario — **bukan** parameter perilaku |
| Kecepatan simulasi | — | Tidak dipakai |
| Editor matriks misi | — | Tidak dipakai |

### 9.3 Seed bukan parameter perilaku

Seed adalah **angka awal untuk generator acak**. Dengan seed yang sama, hasil "acak" selalu sama.

```
seed 48213 → susunan resource identik setiap kali dijalankan
seed 99999 → susunan resource berbeda
```

Fungsinya untuk **reproduksibilitas**: ketiga ronde memakai seed yang sama agar skenarionya identik, dan hasilnya bisa diulang saat sidang.

Karena itu, mengubah seed berarti **mengganti skenario**, bukan mengubah perilaku yang sedang diteliti. Kalau seed diubah antar ronde, perbandingan algoritma jadi tidak valid. Jadi seed **tidak dihitung** sebagai pemenuhan "input yang dapat diubah".

### 9.4 Catatan analisis (bukan implementasi final)

> Bagian ini dulu dipakai untuk membandingkan resource/kebutuhan. **Keputusan akhir: host hanya mengubah durasi**, jadi angka di bawah adalah justifikasi kenapa 12/6 dipilih, bukan pengaturan yang bisa diubah.

Parameter yang benar-benar mengubah perilaku:

1. **Algoritma** — mengubah aturan.
2. **Durasi** — mengubah panjang permainan.
3. **Jumlah resource** — mengubah kepadatan arena.
4. **Jumlah kebutuhan per pemain** — mengubah tingkat overlap.

Dua yang terakhir bersama-sama menentukan seberapa sering deadlock muncul:

| Resource | Kebutuhan/pemain | Total kebutuhan | Rata-rata pemakai per resource | Kecenderungan deadlock |
|---|---|---|---|---|
| 12 | 6 | 24 | 2,0 | Tinggi |
| 12 | 4 | 16 | 1,3 | Sedang |
| 12 | 3 | 12 | 1,0 | Rendah |
| 8 | 6 | 24 | 3,0 | Sangat tinggi |

Angka "rata-rata pemakai per resource" = `(jumlah pemain × kebutuhan) / jumlah resource`. Semakin besar, semakin banyak resource yang diperebutkan.

Dengan mengubah dua input itu, kamu bisa menunjukkan sebab-akibat secara langsung:

> "Kebutuhan 6 dari 12 resource → deadlock 4 kali. Kebutuhan diturunkan ke 3 → deadlock 0 kali."

Itu bukti yang jauh lebih kuat daripada hanya mengganti jumlah resource.

### 9.5 Minimum yang disarankan

- Wajib dan satu-satunya yang diubah host: **durasi ronde**.
- Dikunci: resource 12, kebutuhan 6 per pemain, algoritma per ronde.
- Seed: sebagai tombol "ulangi skenario", bukan parameter perilaku.

---

## 10. Metrik dan Cara Mencatat

### 10.1 Definisi

| Metrik | Satuan | Definisi |
|---|---|---|
| `deadlocks` | kejadian | Jumlah siklus deadlock yang terdeteksi. Satu siklus = 1 kejadian, meskipun melibatkan 2+ pemain |
| `finishedPlayers` | pemain | Jumlah pemain yang mencapai Exit Gate sebelum waktu habis |
| `avgFinishTimeSec` | detik | Rata-rata waktu pemain **yang selesai** |
| `rejectedRequests` | request | Jumlah permintaan yang ditolak sistem |
| `avgWaitTimeSec` | detik | (opsional) Rata-rata waktu menunggu resource |
| `safetyChecks` | kali | (opsional) Jumlah pengecekan safe state di Banker |

### 10.2 Aturan penghitungan

1. `deadlocks` dihitung per siklus, bukan per pemain.
2. `avgFinishTimeSec` hanya dari pemain yang selesai.
3. Jika tidak ada yang selesai, tampilkan `–`, bukan `0`.
4. `rejectedRequests` dijumlahkan dari semua pemain.
5. Waktu tidak boleh melebihi durasi ronde.

### 10.3 Data per pemain vs agregat ronde

Contoh satu ronde (durasi 30 detik):

| Pemain | Deadlock | Selesai | Waktu | Ditolak |
|---|---|---|---|---|
| Budi | 2× | Ya | 18 s | 0 |
| Sari | 1× | Ya | 24 s | 0 |
| Tono | 1× | Tidak | – | 0 |
| Rina | 0× | Tidak | – | 0 |
| **Agregat** | **4×** | **2/4** | **21 s** | **0** |

- Tabel per pemain dipakai untuk skor individu.
- Tabel algoritma memakai baris **Agregat**.
- 21 detik berasal dari `(18 + 24) / 2`, bukan dibagi 4.

### 10.4 Kenapa rata-rata harus ditemani jumlah selesai

| Algoritma | Selesai | Rata-rata waktu | Terlihat | Kenyataan |
|---|---|---|---|---|
| No Prevention | 2/4 | 21 s | Paling cepat | Separuh pemain gagal |
| Resource Ordering | 4/4 | 26 s | Lebih lambat | Semua selesai |

Rata-rata saja menyesatkan. Selalu tampilkan keduanya.

---

## 11. Perbandingan Metrik Antar Algoritma

### 11.1 Cara mengumpulkan

```
Skenario S-48213, 4 pemain yang sama
├── Ronde 1: No Prevention     → catat metrik
├── Ronde 2: Resource Ordering → catat metrik
└── Ronde 3: Banker            → catat metrik
```

✅ Metrik **dicatat saat tiap ronde berjalan**, tetapi tabel perbandingan ini baru **ditampilkan setelah ronde 3 selesai**.

### 11.2 Tabel hasil

| Algoritma | Deadlock | Selesai | Rata-rata waktu | Ditolak |
|---|---|---|---|---|
| No Prevention | 4× | 2/4 | 21 s | 0 |
| Resource Ordering | 0× | 4/4 | 26 s | 3 |
| Banker | 0× | 3/4 | 28 s | 6 |

### 11.3 Cara membaca

- **No Prevention**: paling cepat di antara yang selesai, tidak menolak request, tetapi deadlock 4× dan hanya 2 pemain selesai.
- **Resource Ordering**: tidak ada deadlock, semua selesai, tetapi lebih lambat dan kaku.
- **Banker**: tidak ada deadlock, tetapi menolak 6 request sehingga 1 pemain gagal selesai dan waktunya paling lambat.

Kesimpulan: tidak ada algoritma yang unggul di semua metrik. Pilihan bergantung prioritas: kecepatan, kepastian selesai, atau fleksibilitas.

### 11.4 Yang bukan perbandingan algoritma

| Sumber data | Kegunaan |
|---|---|
| Perbandingan 3 ronde satu turnamen | Tabel utama algoritma |
| Akumulasi semua sesi, dikelompokkan per algoritma | Statistik global / tren |
| Skor per pemain | Leaderboard |

Data semua pengguna **tidak dicampur** ke tabel utama, karena skill pemain dan kondisi jaringan ikut memengaruhi.

### 11.5 Catatan sampel

Tiga ronde hanya menghasilkan satu sampel per algoritma. Untuk klaim statistik yang lebih kuat, ulangi beberapa sesi dan rata-ratakan per algoritma. Untuk kebutuhan sidang, satu sesi 3 ronde cukup sebagai demonstrasi, asalkan keterbatasannya disebutkan.

---

## 12. Sistem Skor

### 12.1 Rumus (per ronde)

```
Base Score            : 100
+ 50 per resource     : dipegang saat ronde berakhir
+ 200 jika selesai    : mencapai Exit Gate
- 15 per deadlock     : hanya untuk pemain yang terlibat
+ 100 jika 0 deadlock
+ Speed Bonus         : #1=100, #2=75, #3=50, #4=25
Minimum               : 0
```

### 12.2 Akumulasi

✅ Skor akhir Deadlock Dungeon = jumlah skor ketiga ronde.

Speed bonus tiap ronde ikut dijumlahkan.

### 12.3 Catatan keadilan

Speed bonus sensitif terhadap posisi awal. Peta simetris mengurangi bias ini. Jika peta belum simetris, bobot speed bonus sebaiknya diturunkan.

---

## 13. Aturan Versi Online

### 13.1 Otoritas server

Server yang menentukan:

- Pembuatan skenario dan seed.
- Penerimaan atau penolakan permintaan resource.
- Deteksi deadlock dan recovery.
- Perhitungan safe state.
- Waktu selesai.
- Skor dan metrik.

Client hanya:

- Menampilkan state.
- Mengirim input gerakan/permintaan.
- Menampilkan hasil dari server.

> Alokasi resource, deteksi siklus, dan safe state **tidak boleh** dihitung di client. Jika dihitung di browser, tiap pemain bisa menghasilkan keputusan berbeda.

### 13.2 Sinkronisasi

- Posisi pemain dan resource disinkronkan lewat Socket.io.
- Alokasi resource, deteksi siklus, dan safe state sudah diputuskan di server ✅.
- ✅ Gerakan memakai **sinkronisasi sederhana**: client mengirim posisi ke server, server meneruskan ke pemain lain. Server boleh menolak koordinat yang melompat terlalu jauh, tetapi tidak menghitung gerakan itu sendiri.
- Event gameplay yang tersedia saat ini masih placeholder:
  - `game:input`
  - `minigame:submit_score`

### 13.3 Penyimpanan metrik

✅ Keputusan final:

- Setiap pemain menyimpan satu baris di `minigame_scores` dengan `metrics` JSONB.
- `metrics` berisi kontribusi pemain + info ronde (algorithm, scenarioId, round).
- Agregat ronde dihitung di backend saat menampilkan hasil.
- Tabel baru khusus metrik ronde **tidak dipakai**.

Contoh isi `metrics` per pemain:

```json
{
  "round": 1,
  "algorithm": "no_prevention",
  "scenarioId": "S-48213",
  "deadlocks": 2,
  "finished": true,
  "finishTimeSec": 18,
  "rejectedRequests": 0
}
```

### 13.4 Perpindahan status room

```
waiting → starting → playing → (minigame berikutnya) → finished
```

Perubahan status memicu `rooms:updated` agar daftar room publik ikut diperbarui.

---

## 14. Pemenuhan Ketentuan Dosen

| Ketentuan | Status | Bukti |
|---|---|---|
| Minimal 3 algoritma per modul | ✅ | Detection & Recovery, Prevention, Avoidance |
| Visualisasi langkah demi langkah | ✅ | Arena + log berstruktur + tabel kecil Banker |
| Input dapat diubah | ✅ | Durasi ronde (resource 12 & kebutuhan 6 dikunci) |
| Perbandingan metrik | ✅ | 3 ronde skenario sama, agregat ditampilkan setelah ronde 3 |
| 4 pemain | ✅ | Tombol mulai disabled sampai tepat 4 pemain + semua tamu ready |
| Argumen keadilan | ✅ | Peta simetris + resource pertama berbeda |

---

## 15. Daftar Keputusan Lengkap

### ✅ Disepakati

1. Tiga algoritma dan mekanismenya.
2. 3 ronde per sesi Deadlock Dungeon.
3. Skenario sama di ketiga ronde.
4. Definisi skenario dan bahwa urutan pemain bukan bagian dari skenario.
5. Metrik: deadlock, selesai, rata-rata waktu, request ditolak.
6. Rata-rata waktu hanya dari pemain yang selesai.
7. Jumlah selesai wajib ditampilkan bersama rata-rata waktu.
8. Tabel algoritma = agregat semua pemain, satu baris per algoritma.
9. Perbandingan algoritma memakai data satu turnamen, bukan semua pengguna.
10. Data semua pengguna dipisahkan untuk leaderboard/statistik global.
11. Jumlah resource 12 (R1–R12), 6 per pemain.
12. Durasi ronde 30 detik.
13. Peta simetris 4 sudut + misi dengan resource pertama berbeda.
14. Tanpa rotasi posisi antar ronde.
15. Skor ketiga ronde dijumlahkan.
16. Seed = kontrol reproduksibilitas skenario, bukan pemenuhan "input dapat diubah".
17. Input host hanya durasi; resource 12 dan kebutuhan 6 per pemain dikunci.
18. Metrik per pemain disimpan di `minigame_scores.metrics` (JSONB), lalu diagregasi — tanpa tabel baru.
19. Tabel perbandingan algoritma ditampilkan setelah ronde 3 selesai.
20. Room mulai hanya jika tepat 4 pemain dan semua tamu ready; bot tidak dipakai.
21. Tidak ada mode cepat; setiap permainan selalu 3 ronde, 3 algoritma.
22. Visualisasi langkah demi langkah: log berstruktur + satu tabel kecil Banker.
23. Otoritas **gerakan**: sinkronisasi sederhana; alokasi/deadlock/safe state tetap di server.

---

## 16. Roadmap

| Game | Topik | Status |
|---|---|---|
| Minigame 1: Deadlock Dungeon | Deadlock | Dokumen ini |
| Minigame 2 | Belum ditentukan | Placeholder |
| Minigame 3 | Belum ditentukan | Placeholder |

---

## 17. Lampiran: Perbedaan dengan Versi Standalone

| Aspek | Versi standalone lama | Versi online |
|---|---|---|
| Pemain | 1 human + 3 bot | 4 manusia |
| Bentuk | Satu file HTML | React + Express + Socket.io |
| Logika | Di client | Server-authoritative |
| Metrik | Dihitung di browser | Disimpan di database |
| Algoritma | Dipilih di menu lokal | Dipilih host, berlaku per ronde |
| Perbandingan | Estimasi algoritma yang belum dimainkan | Data nyata 3 ronde |
| Resource | Dokumen menyebut 10 dan 12 | 12 resource, 6 per pemain ✅ |
