# Smart Blind Database Monitor

Dashboard administratif berbasis web (React + Vite) untuk memantau data operasional sistem *Smart Blind*. Aplikasi ini terhubung langsung ke database Supabase dan dirancang untuk memberikan visibilitas instan terhadap interaksi AI dan log aplikasi.

## 🌟 Fitur Utama

- **Otentikasi Admin**: Akses dashboard diamankan menggunakan kredensial login (diatur via environment variables).
- **Monitoring Real-time**: Mengambil data secara instan dan aman menggunakan `service_role` key untuk memotong limitasi RLS.
- **AI Histories (Riwayat Interaksi)**: Melacak prompt dan respons yang dihasilkan oleh *Artificial Intelligence* pada perangkat Smart Blind.
- **App Logs (Log Sistem)**: Menampilkan catatan proses aplikasi lengkap dengan tingkat kritikal *(level)*, *tag*, dan detail *error* (disertai indikator warna badge).
- **Desain Klasik & Elegan**: Antarmuka responsif dan mulus yang dibangun dengan standar estetika premium dan CSS kustom.

## 🛠 Teknologi yang Digunakan

- **Frontend Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Database Service**: [Supabase](https://supabase.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Styling**: Vanilla CSS

## 🚀 Cara Menjalankan secara Lokal

1. **Persiapan Dependensi**
   Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di komputer Anda. Lalu instal seluruh package:
   ```bash
   npm install
   ```

2. **Konfigurasi Environment**
   Buat file `.env` di root direktori project ini (file ini diabaikan oleh Git untuk keamanan). Tambahkan konfigurasi berikut:
   ```env
   VITE_SUPABASE_URL=https://[ID-PROJECT].supabase.co
   VITE_SUPABASE_ANON_KEY=[MASUKKAN_SERVICE_ROLE_KEY_ANDA]
   VITE_ADMIN_USERNAME=
   VITE_ADMIN_PASSWORD=
   ```
   *(Catatan: Sangat disarankan menggunakan `service_role` key dari Supabase agar bisa mengabaikan pembatasan Row Level Security / RLS).*

3. **Jalankan Server Lokal**
   ```bash
   npm run dev
   ```
   Web server akan menyala (biasanya di `http://localhost:5173`). Buka link tersebut melalui browser Anda.

## 📦 Deployment (Vercel)

Aplikasi ini dapat langsung di-*deploy* ke Vercel atau platform hosting lainnya. 
1. Import repositori ini di dashboard Vercel.
2. Pada pengaturan deployment, masukkan ke-4 Environment Variables di atas ke tab **Environment Variables**.
3. Deploy!

---
*Dibuat untuk mempermudah monitoring operasional pada project Smart Blind Assistant.*
