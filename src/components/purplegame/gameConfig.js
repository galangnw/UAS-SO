export const PURPLE_ROUNDS = [
  {
    round: 1,
    mode: 'tanpa-aturan',
    title: 'TANPA ATURAN',
    subtitle: 'RACE CONDITION! Dua petinju masuk bersamaan.',
    badge: 'Ronde 1/3',
    duration: 20,
    slots: 0,
    nextLabel: 'MUTEX',
  },
  {
    round: 2,
    mode: 'mutex',
    title: 'MUTEX',
    subtitle: 'Satu kunci, satu petinju di dalam ring.',
    badge: 'Ronde 2/3',
    duration: 20,
    slots: 1,
    nextLabel: 'SEMAPHORE',
  },
  {
    round: 3,
    mode: 'semaphore',
    title: 'SEMAPHORE',
    subtitle: 'Dua kunci, dua petinju boleh di dalam ring.',
    badge: 'Ronde 3/3',
    duration: 20,
    slots: 2,
    nextLabel: null,
  },
];

export const PLAYERS = [
  { key: 'merah', name: 'Merah', color: '#ff0000', labelColor: 'text-[red]' },
  { key: 'kuning', name: 'Kuning', color: '#fffb00', labelColor: 'text-[#fffb00]' },
  { key: 'biru', name: 'Biru', color: '#0040ff', labelColor: 'text-[#0040ff]' },
  { key: 'hijau', name: 'Hijau', color: '#00d26a', labelColor: 'text-[#00d26a]' },
];

export function initialScores() {
  return { merah: 0, kuning: 0, biru: 0, hijau: 0 };
}

export function initialRoundMetrics() {
  return {
    merah: [0, 0, 0],
    kuning: [0, 0, 0],
    biru: [0, 0, 0],
    hijau: [0, 0, 0],
  };
}
