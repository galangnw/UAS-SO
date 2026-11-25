import goyangBiru from '../assets/lobby/anim/goyang-blue.png';
import goyangHijau from '../assets/lobby/anim/goyang-hijau.png';
import goyangKuning from '../assets/lobby/anim/goyang-yellow.png';
import goyangMerah from '../assets/lobby/anim/goyang-merah.png';

/**
 * Sumber tunggal warna pemain. Urutan ini sama dengan backend:
 * Merah, Hijau, Biru, Kuning. Warna berasal dari avatarColor payload server,
 * bukan dari urutan index tiap halaman.
 */
export const PLAYERS = [
  {
    key: 'merah',
    name: 'Merah',
    color: '#FF5A5F',
    labelColor: 'text-[#FF5A5F]',
    sprite: goyangMerah,
  },
  {
    key: 'hijau',
    name: 'Hijau',
    color: '#2FD07A',
    labelColor: 'text-[#2FD07A]',
    sprite: goyangHijau,
  },
  {
    key: 'biru',
    name: 'Biru',
    color: '#4d8dff',
    labelColor: 'text-[#4d8dff]',
    sprite: goyangBiru,
  },
  {
    key: 'kuning',
    name: 'Kuning',
    color: '#ffc22e',
    labelColor: 'text-[#ffc22e]',
    sprite: goyangKuning,
  },
];

export const AVATAR_COLORS = PLAYERS.map((player) => player.key);

export const COLOR_HEX = Object.fromEntries(
  PLAYERS.map((player) => [player.key, player.color]),
);

export const COLOR_NAMES = Object.fromEntries(
  PLAYERS.map((player) => [player.key, player.name]),
);

export const AVATAR_SPRITES = Object.fromEntries(
  PLAYERS.map((player) => [player.key, player.sprite]),
);
