# API Contract: Lobby & Room — Kernel Clash Arcade

Versi: 1.0
Cakupan: `game - 5 Buat Room`, `game - 5 Gabung Room`, `game - Lobi (Host)`, `game - Lobi (Tamu)`, Overlay Toast/Popup.

> Catatan: warna pemain hanya `merah`, `hijau`, `biru`, `kuning`. Backend yang menetapkan `avatarColor` + `name` (nama = warna) saat join room, lalu nilai yang sama dipakai lobby, game 1, game 2, dan skor akhir.

---

## 1. REST API (HTTP)

Base URL: `/api`

### 1.1 Guest Auth
**POST** `/api/auth/guest`

Buat session tamu (dipanggil dari layar Loading).

**Request**
```json
{
  "name": "string (1-12 char)",
  "avatarColor": "merah" | "hijau" | "biru" | "kuning"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "name": "string",
    "avatarColor": "merah"
  }
}
```

---

### 1.2 List Room Publik
**GET** `/api/rooms`

Daftar room `status=waiting`, `isPrivate=false`, `currentPlayers < maxPlayers`.

**Response 200**
```json
{
  "success": true,
  "data": [
    {
      "roomId": "uuid",
      "code": "X7K9P",
      "name": "string",
      "currentPlayers": 2,
      "maxPlayers": 4
    }
  ]
}
```

---

### 1.3 Buat Room
**POST** `/api/rooms`

**Request**
```json
{
  "name": "string (1-20)",
  "isPrivate": "boolean",
  "userId": "uuid"
}
```

**Response 201**
```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "code": "X7K9P",
    "name": "string",
    "isPrivate": false,
    "maxPlayers": 4,
    "hostId": "uuid"
  }
}
```

---

### 1.4 Cek Kode Room (Validasi Sebelum Join Manual)
**GET** `/api/rooms/:code`

**Response 200**
```json
{
  "success": true,
  "data": {
    "roomId": "uuid",
    "code": "X7K9P",
    "name": "string",
    "status": "waiting",
    "currentPlayers": 3,
    "maxPlayers": 4
  }
}
```

**Error Responses**
| Code | HTTP | Body |
|------|------|------|
| ROOM_NOT_FOUND | 404 | `{ "success": false, "error": { "code": "ROOM_NOT_FOUND", "message": "..." } }` |
| ROOM_FULL | 409 | `{ "error": { "code": "ROOM_FULL" } }` |
| ROOM_PRIVATE | 403 | `{ "error": { "code": "ROOM_PRIVATE" } }` |

---

## 2. WebSocket Events (Socket.io)

Namespace: `/`
Auth: `socket.handshake.auth.userId` (uuid dari `/api/auth/guest`).

Semua broadcast real-time dikirim ke `io.to(roomCode)`.

---

### 2.1 Join Room
**Client → Server**
```js
socket.emit('room:join', { code: 'X7K9P' })
```

**Server → Sender (Full State Lobi)**
```js
socket.emit('room:state', {
  room: { roomId, code, name, status: 'waiting', maxPlayers: 4 },
  players: [
    { userId, name, avatarColor, isHost: true, isReady: true, joinedAt },
    { userId, name, avatarColor, isHost: false, isReady: false, joinedAt }
  ],
  me: { userId, isHost: boolean }
})
```

**Server → Others (Broadcast)**
```js
socket.to(code).emit('room:player_joined', {
  userId, name, avatarColor, isHost: false, isReady: false, joinedAt
})
```

---

### 2.2 Leave Room
**Client → Server**
```js
socket.emit('room:leave', { code: 'X7K9P' })
```

**Server → Room (Broadcast)**
- Tamu keluar: `room:player_left { userId, name }`
- Host keluar: `room:disbanded { reason: 'HOST_LEFT' }` → FE redirect ke halaman utama.

---

### 2.3 Toggle Siap (Tamu Only)
**Client → Server**
```js
socket.emit('room:set_ready', { code: 'X7K9P', isReady: true })
```

**Server → Room (Broadcast)**
```js
socket.to(code).emit('room:player_ready', { userId, isReady: true })
```

> Host selalu `isReady: true` di DB. Tombol Siap tidak ditampilkan untuk Host.

---

### 2.4 Kick Player (Host Only)
**Host → Server**
```js
socket.emit('room:kick', { code: 'X7K9P', targetUserId: 'uuid' })
```

**Server → Target (Private)**
```js
io.to(targetSocketId).emit('room:kicked', { reason: 'KICKED_BY_HOST' })
```

**Server → Room (Broadcast)**
```js
socket.to(code).emit('room:player_left', { userId: 'uuid', name: '...', reason: 'KICKED' })
```

---

### 2.5 Mulai Turnamen (Host Only)
**Host → Server**
```js
socket.emit('tournament:start', { code: 'X7K9P' })
```

**Server → Room (Broadcast)** — Trigger Popup "Game Dimulai" + Countdown 3 detik.
```js
io.to(code).emit('tournament:starting', {
  countdown: 3,
  firstMinigame: 1
})
```

> Setelah ini FE navigate ke layar Minigame 1. Event gameplay kontrak terpisah.

---

### 2.6 Toast / Error Notifikasi
**Server → Client (Private atau Broadcast)**
```js
// Private error
socket.emit('toast', { type: 'error', message: 'Room sudah penuh' })

// Broadcast info
io.to(code).emit('toast', { type: 'info', message: 'Kode room disalin ke clipboard' })
```

**Type**: `'error' | 'info' | 'success'`

---

## 3. Validasi Bisnis (Server-Side)

| Event | Syarat | Gagal → Toast/Error |
|-------|--------|---------------------|
| `room:join` | Room exists, `status=waiting`, `players < 4` | `ROOM_NOT_FOUND`, `ROOM_FULL`, `ROOM_PRIVATE` |
| `room:set_ready` | User di room, bukan host | Ignore / `NOT_ALLOWED` |
| `room:kick` | Sender = host, target ≠ host | `NOT_HOST`, `CANNOT_KICK_HOST` |
| `tournament:start` | Sender = host, `players > 1`, semua `isReady=true` | `NOT_HOST`, `NOT_ENOUGH_PLAYERS`, `PLAYERS_NOT_READY` |

---

## 4. TypeScript Types (Ringkas)

```ts
type AvatarColor = 'merah' | 'hijau' | 'biru' | 'kuning';

interface RoomPlayer {
  userId: string;
  name: string;
  avatarColor: AvatarColor;
  isHost: boolean;
  isReady: boolean;
  joinedAt: string; // ISO 8601
}

interface RoomState {
  room: {
    roomId: string;
    code: string;
    name: string;
    status: 'waiting';
    maxPlayers: 4;
  };
  players: RoomPlayer[];
  me: { userId: string; isHost: boolean };
}
```

---

## 5. Mapping ke Figma Layer

| Figma Layer / Komponen | API / Event |
|------------------------|-------------|
| `game - 5 Buat Room` → Input Nama Room, Privasi Publik/Privat, Pemain 4, Button Buat Room | `POST /api/rooms` |
| `game - 5 Gabung Room` → Kode Room Card (input), Button Buat Room (shortcut) | `GET /api/rooms/:code` → `room:join` |
| `game - Lobi (Host)` → Player Card 1 (Host), Player Card 2-4, Invite Card, Badge HOST, Kode Room Bar, Button Salin, Button Mulai (aktif/nonaktif) | `room:state`, `room:kick`, `tournament:start` |
| `game - Lobi (Tamu)` → Player Cards, Badge KAMU, Button Siap / Batal Siap | `room:set_ready`, `room:leave` |
| `Overlay: Popup · Buburkan room?` | Konfirmasi FE → `room:leave` (host) → `room:disbanded` |
| `Overlay: Toast · Kode disalin / Daftar diperbarui / Error` | `toast` event |

---

## 6. Catatan Implementasi

- **Database**: Hanya dipanggil saat `join`, `leave`, `kick`, `set_ready` (update `room_players`), dan `tournament:start` (update `rooms.status`).
<<<<<<< HEAD
- **Gameplay (WASD, grab resource, skor)**: **TIDAK** ada di kontrak ini. Kontrak terpisah untuk minigame (jumlah & tema belum final).
- **Connection Pool**: Gunakan PgBouncer (port 6543) dari Supabase.
- **SSL**: `rejectUnauthorized: false` wajib untuk koneksi Supabase.

---

## 7. Pembagian Pemilik Halaman (Frontend A & B)

Satu repo, satu aplikasi. Keduanya memakai kontrak ini.

| Halaman | Pemilik | Butuh |
|---|---|---|
| Guest / identitas otomatis | A | `POST /api/auth/guest` |
| `game - 5 Buat Room` | A | `POST /api/rooms` |
| `game - 5 Gabung Room` | A | `GET /api/rooms`, `GET /api/rooms/:code` |
| `game - Lobi (Host)` / `(Tamu)` | B | `room:join` dan semua event ruang tunggu |
| Popup bubarkan room | B | `room:leave` → `room:disbanded` |

### Serah terima A → B

Setelah REST buat/gabung room sukses, A menyerahkan:

- **Wajib**: `code` room (idealnya juga ada di URL, misal `/room/:code`, agar tahan refresh).
- **Opsional**: objek room hasil REST (`roomId`, `code`, `name`, `maxPlayers`, ...) untuk render awal tanpa layar loading.

B tetap wajib `emit('room:join', { code })`. Data dari A hanya untuk render pertama;
`room:state` dari server adalah sumber kebenaran.

`GET /api/rooms/:code` dipakai B **hanya sebagai fallback** saat halaman di-refresh atau dibuka lewat link langsung — bukan setiap kali navigasi.

### Aturan yang tidak boleh dilanggar

- **Hanya B** yang membuat koneksi socket untuk room. A tidak membuka socket.
- **Satu instance socket** untuk seluruh aplikasi (`src/lib/socket.js`).
- **Satu `App.jsx`** — milik A. B cukup mengganti komponen halaman room, tidak membuat routing sendiri.
=======
- **Gameplay (WASD, grab resource, skor)**: **TIDAK** ada di kontrak ini. Kontrak terpisah untuk Minigame 1-3.
- **Connection Pool**: Gunakan PgBouncer (port 6543) dari Supabase.
- **SSL**: `rejectUnauthorized: false` wajib untuk koneksi Supabase.
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
