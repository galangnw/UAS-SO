// Konfigurasi ronde. `locks` = jumlah slot kunci di ring:
// 0 = Tanpa Aturan, 1 = Mutex, 2 = Semaphore.
export const PURPLE_ROUNDS = [
  {
    round: 1,
    mode: 'tanpa-aturan',
    title: 'TANPA ATURAN',
    subtitle: 'RACE CONDITION! Dua petinju masuk bersamaan.',
    badge: 'Ronde 1/3',
    duration: 20,
    locks: 0,
    nextLabel: 'MUTEX',
    rule: {
      cardTitle: 'Ronde 1: TANPA ATURAN',
      paragraphs: [
        'Lari ke piala di tengah! Kalau dua petinju ada di zona emas bersamaan, ring MELEDAK dan semuanya terpental. Itu race condition.',
        'Tekan PUKUL! sebanyak-banyaknya supaya petinjumu maju. Ambil piala di tengah = 1 poin, lalu kembali ke pojok. Waktu 20 detik.',
      ],
    },
  },
  {
    round: 2,
    mode: 'mutex',
    title: 'MUTEX',
    subtitle: 'Satu kunci, satu petinju di dalam ring.',
    badge: 'Ronde 2/3',
    duration: 20,
    locks: 1,
    nextLabel: 'SEMAPHORE',
    rule: {
      cardTitle: 'Ronde 2: MUTEX',
      paragraphs: [
        'Satu kunci, satu petinju di dalam ring. Petinju lain harus menunggu sampai kunci dilepas.',
        'Tekan PUKUL! untuk maju. Kalau kunci sedang dipakai, petinjumu menunggu di luar zona emas. Waktu 20 detik.',
      ],
    },
  },
  {
    round: 3,
    mode: 'semaphore',
    title: 'SEMAPHORE',
    subtitle: 'Dua kunci, dua petinju boleh di dalam ring.',
    badge: 'Ronde 3/3',
    duration: 20,
    locks: 2,
    nextLabel: null,
    rule: {
      cardTitle: 'Ronde 3: SEMAPHORE',
      paragraphs: [
        'Dua kunci tersedia. Maksimal dua petinju boleh berada di dalam ring bersamaan.',
        'Kalau kedua kunci terpakai, petinju berikutnya harus menunggu. Tekan PUKUL! untuk maju dan rebut piala. Waktu 20 detik.',
      ],
    },
  },
];

import { PLAYERS } from '../../config/playerColors';

export { PLAYERS };

export const initialScores = () =>
  PLAYERS.reduce((acc, p) => ({ ...acc, [p.key]: 0 }), {});

export const initialRoundMetrics = () =>
  PLAYERS.reduce((acc, p) => ({ ...acc, [p.key]: [0, 0, 0] }), {});
