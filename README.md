# 🌟 Khaulah's 3D Rainbow World (Dunia Petualangan Khaulah)

Game web 3D interaktif yang dibuat dengan teknologi modern (React 18, Three.js, React Three Fiber, Vite, Tailwind CSS, Web Audio API), dirancang khusus untuk anak perempuan usia 6 tahun (Khaulah) dengan kontrol khas Roblox yang dioptimalkan untuk MacBook.

![Khaulah World 3D](https://img.shields.io/badge/Made%20With-Three.js%20%26%20R3F-blueviolet?style=for-the-badge)
![MacBook Ready](https://img.shields.io/badge/MacBook-Trackpad%20%26%20Roblox%20Controls-success?style=for-the-badge)

---

## ✨ Fitur Game

1. **Karakter Khaulah yang Menggemaskan**:
   - Model 3D dengan busana seragam sekolah khas: jilbab bergo putih rapi, ciput dahi hitam, rompi biru (*3 kancing & lencana hijau sekolah*), rok lipit biru, lengan panjang putih, kaos kaki putih, dan sepatu hitam.
   - Wajah kartun ekspresif (senyuman manis, pipi merona, kedua mata jernih dengan kilau ganda).
   - Animasi prosedural berjalan, lompat, melambai (*wave*), dan berjoget ceria (*dance*).

2. **Dunia Obby (Obstacle Course) Ramah Anak (Zero-Frustration)**:
   - Jalur balok pelangi (*Rainbow Stepping Stones*).
   - Pulau gula-gula & trampolin super tinggi.
   - Jembatan langit dan Istana Bintang Khaulah di puncak awan.
   - 25 bintang ajaib yang bisa dikoleksi dengan efek kilau dan suara marimba.
   - Tidak ada kata "Game Over" / kalah: jika terjatuh, Khaulah akan melayang kembali ke titik *checkpoint* terdekat dengan lembut.

3. **Sahabat Hewan Interaktif (NPC)**:
   - Bebek lucu di kolam mini (*Kwek-kwek!*).
   - Kucing oranye manis (*Meong!*).
   - Kelinci putih yang melompat gembira.
   - Panda yang sedang asyik makan bambu.

4. **Lemari Pakaian & Hewan Peliharaan**:
   - Aksesoris: Mahkota Putri, Sayap Peri, Telinga Kelinci, Telinga Kucing, Halo Bintang.
   - Peliharaan: Kucing kecil, Anak anjing, atau Peri kecil yang setia mengikuti langkah Khaulah.

5. **Kontrol MacBook ala Roblox**:
   - `W` / `A` / `S` / `D` atau Tombol Panah: Berjalan.
   - `Spasi`: Melompat (*dengan coyote-time & jump buffer untuk kemudahan anak*).
   - *Drag 2 Jari Trackpad / Klik Kanan*: Putar kamera 360°.
   - *Scroll 2 Jari*: Zoom in / zoom out kamera (atau tombol `I` / `O`).
   - `Shift`: Mengaktifkan *Shift Lock* dengan crosshair retikel di tengah layar.
   - `E`: Melambaikan tangan 👋
   - `Q`: Berjoget ceria 💃
   - `R`: Kembali ke checkpoint 🔄

---

## 🚀 Menjalankan Secara Lokal

Pastikan Node.js (versi 18+) sudah terpasang di komputer Anda:

```bash
# Clone repository
git clone https://github.com/sarrahman-me/game-khaulah.git
cd game-khaulah

# Pasang dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka browser di `http://localhost:3000` untuk mulai bermain!

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **3D Graphics Engine**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Audio**: Web Audio API sintetis (zero-lag, marimba sound generator)
- **Bundler**: [Vite](https://vitejs.dev/)
