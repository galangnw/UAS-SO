# Stick Brawl Flow Export — Figma Plugin

Plugin Figma **read-only** untuk mengekspor data prototype dari file `SO`
(`By2IbA1mkjBXSA9eH0uxB9`) ke JSON, supaya alur animasi tiap frame bisa
direkonstruksi di kode (`src/components/purplegame`).

Plugin ini **tidak mengubah** file Figma. Hanya membaca:

- `node.getReactionsAsync()` / `node.reactions` → trigger, aksi, tujuan, transisi
- `page.flowStartingPoints` → flow yang bisa dijalankan dari prototype
- peta `node.id → nama/tipe/halaman` → supaya `destinationId` bisa dibaca sebagai nama frame

## Isi folder

| File | Fungsi |
| --- | --- |
| `manifest.json` | Manifest plugin (api 1.0.0, `documentAccess: dynamic-page`, tanpa network) |
| `code.js` | Logika ekspor + UI untuk Copy / Download JSON |
| `README.md` | Dokumen ini |

## Cara menjalankan (Figma desktop)

1. Buka **Figma desktop app** (plugin development tidak jalan di browser).
2. Buka file **SO**.
3. Menu **Plugins → Development → Import plugin from manifest…**
4. Pilih file `tools/figma-flow-export/manifest.json` di repo ini.
5. Jalankan **Plugins → Development → Stick Brawl Flow Export**.
6. Tunggu sampai muncul status seperti `N reactions · M transisi · K flow`.
7. Ambil hasilnya:
   - **Copy JSON** → tempel ke chat, atau
   - **Download .json** → simpan sebagai `stick-brawl-flow.json` lalu lampirkan.

## Struktur JSON

```jsonc
{
  "file": "SO",
  "generatedAt": "2026-...",
  "summary": {
    "pages": 2,
    "nodesScanned": 0,
    "flows": 0,
    "nodesWithReactions": 0,
    "reactions": 0,
    "transitions": 0
  },
  "flowStartingPoints": [
    { "page": "stick brawl", "nodeId": "1:173", "name": "Flow 1", "frameName": "Stick Brawl", "frameType": "FRAME" }
  ],
  "graph": [
    {
      "from": { "id": "1:173", "name": "Stick Brawl", "page": "stick brawl" },
      "transitions": [
        {
          "trigger": "ON_CLICK",
          "triggerDetail": { "type": "ON_CLICK" },
          "action": "NODE",
          "to": { "id": "25:1575", "name": "04 Race Condition BOOM", "type": "FRAME", "page": "stick brawl" },
          "navigation": "NAVIGATE",
          "transition": { "type": "SMART_ANIMATE", "duration": 0.3, "easing": { "type": "EASE_OUT" } },
          "overlay": null,
          "url": null
        }
      ]
    }
  ],
  "allReactions": [
    { "page": "stick brawl", "nodeId": "6:675", "nodeName": "Merah_jalan_2 1", "nodeType": "FRAME", "reactions": [] }
  ]
}
```

Catatan:

- `graph` hanya berisi node yang punya minimal satu transisi.
- `allReactions` berisi reaksi mentah semua node yang punya reaksi (untuk detail
  yang tidak dipetakan, mis. `ON_KEY_DOWN`, `AFTER_TIMEOUT`, `ON_DRAG`).
- `transition` berisi tipe animasi (`SMART_ANIMATE`, `DISSOLVE`, `MOVE_IN`, …),
  `duration`, dan `easing` — inilah yang dipakai untuk menyamakan animasi di app.

## Setelah JSON didapat

Kirimkan JSON-nya (tempel atau lampirkan). Dari situ akan direkonstruksi:

- frame mana yang jadi titik awal flow,
- urutan frame (`Stick Brawl → Intro Ronde → Arena → Waktu Habis → Hasil`),
- trigger tiap perpindahan (klik tombol, timeout, drag),
- durasi + easing + jenis transisi untuk tiap animasi.

Lalu implementasi animasi/transisi di `src/components/purplegame` disesuaikan
dengan data tersebut.

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Menu Development tidak muncul | Pastikan pakai aplikasi desktop Figma, bukan web. |
| `figma.getReactionsAsync is not a function` | Versi Figma lama — plugin otomatis fallback ke `node.reactions`. |
| Hasil `0 reactions` | Prototype mungkin belum dibuat, atau file hanya berisi desain statis. Coba jalankan flow di panel Prototype untuk memastikan flow-nya ada. |
| JSON kosong / `_unserializable` | Ada nilai kompleks yang tidak bisa di-serialize; data lain tetap aman. |
