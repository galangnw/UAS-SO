# Gameplay Contract — Stick Brawl (Minigame 1)

Kontrak lobi/tournament ada di `API_CONTRACT_LOBBY_ROOM.md`. Dokumen ini hanya
menambahkan event gameplay yang dipakai `PurpleGame` setelah `tournament:start`.

Semua event memakai instance socket yang sama (`src/lib/socket.js`) dan room
`code` yang sama seperti lobi. Payload Socket.IO tidak dibungkus `success/data`.

## 1. Client → Server

### `minigame:input` — input PUKUL! dari tamu
Host menjalankan mesin permainan, jadi tamu hanya mengirim input.

```js
socket.emit('minigame:input', {
  code: 'X7K9P',
  minigame: 1,
  type: 'punch',
  key: 'merah',          // merah | kuning | biru | hijau
  userId: 'uuid-pengirim',
});
```

Server wajib:
- memastikan `userId` adalah anggota room `code`;
- memastikan `key` sesuai kursi `userId` tersebut;
- meneruskan event ini ke **host room** (boleh juga broadcast ke room; host
  mengabaikan input yang bukan dari pemain bersangkutan).

### `minigame:complete` — hasil akhir dari host
Dikirim sekali saat leaderboard selesai.

```js
socket.emit('minigame:complete', {
  code: 'X7K9P',
  minigame: 1,
  scores: { merah: 4, kuning: 2, biru: 3, hijau: 1 },
  roundScores: {
    merah: [1, 1, 2], kuning: [1, 0, 1],
    biru: [0, 2, 1], hijau: [0, 0, 1],
  },
  boomCount: 2,
  boomByRound: [2, 0, 0],
  boomByPlayer: { merah: 2, kuning: 2, biru: 1, hijau: 1 },
  ranking: [/* player objects dari ResultScreen */],
});
```

Server wajib:
- menyimpan skor ke `minigame_scores` (`minigame_number = 1`, metrik OS di kolom
  `metrics`) atau setara;
- hanya menerima payload dari host room;
- melanjutkan turnamen ke minigame berikutnya.

## 2. Server → Room

### `minigame:state` — snapshot dari host ke tamu
Host mengirim snapshot ini tiap kali state berubah (gerakan fighter ~60 ms,
skor, kunci, phases, dll).

```js
io.to(code).emit('minigame:state', {
  code: 'X7K9P',
  minigame: 1,
  state: {
    phase: 'arena',        // intro | rule | arena | calculating | result | summary
    roundIndex: 1,
    timeLeft: 17,
    scores: { /* ... */ },
    roundScores: { /* ... */ },
    boomCount: 0,
    boomByRound: [0, 0, 0],
    boomByPlayer: { /* ... */ },
    toast: '',
    inRing: ['merah'],
    boom: false,
    heldSlots: ['merah'],
    waiting: ['biru'],
    stunned: [],
    fighters: { /* step & walking per key */ },
    walkFrame: 2,
    timeUpActive: false,
    eventLog: [],
    logStep: 0,
  },
});
```

Catatan:
- Tamu **tidak** menjalankan timer atau logika kunci sendiri; mereka hanya
  merender snapshot.
- Host mengganti `phase: 'settings'` menjadi `'intro'` saat broadcast, sehingga
  layar pengaturan tetap khusus host.
- Filter di client menolak payload dengan `code` / `minigame` yang tidak cocok.
