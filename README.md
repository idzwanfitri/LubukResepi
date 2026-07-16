# MasakApa

> Ada bahan, ada resepi.

Platform resepi percuma yang menghimpunkan resepi pelbagai kaum, negeri dan negara — dibina khas untuk keluarga Malaysia. Laman ini dibina sebagai laman statik (HTML/CSS/JavaScript + JSON), tanpa memerlukan pelayan atau pangkalan data.

Ini ialah **Fasa 1 (MVP)** projek — lihat [Roadmap](#roadmap) di bawah untuk fasa seterusnya.

## Ciri-ciri

- **Halaman utama** — carian pantas, kategori popular, resepi pilihan, penjelajahan mengikut kaum/negara
- **Senarai resepi** dengan penapis (kategori, negara, kaum, kesukaran, masa memasak) dan pilihan susunan
- **Halaman detail resepi** — bahan, langkah memasak, tips, bahan pengganti, resepi berkaitan
- **Pelaras hidangan** — sukatan bahan berubah secara automatik mengikut bilangan hidangan
- **Cari Ikut Bahan** — pilih bahan yang ada di dapur, sistem cadangkan resepi mengikut peratus padanan (tanpa AI, dikira terus dalam JavaScript)
- Reka bentuk responsif untuk telefon, tablet dan desktop
- Cetak resepi dan kongsi pautan

## Struktur Projek

```
index.html          Halaman utama
recipes.html         Senarai & penapis resepi
recipe.html           Halaman detail resepi (?slug=...)
search.html            Cari resepi ikut bahan
about.html               Tentang MasakApa
contact.html               Hubungi kami

assets/
  css/
    style.css        Reka bentuk asas (mobile-first)
    responsive.css     Override untuk skrin lebih besar
  js/
    app.js           Utiliti dikongsi (fetch data, kad resepi, nav mudah alih)
    filters.js         Logik penapis & susunan
    recipes.js            Logik halaman senarai resepi
    search.js                Logik carian ikut bahan
    recipe-detail.js           Logik halaman detail + pelaras hidangan
  images/            Ruang untuk gambar sebenar (recipes/categories/countries/ui)

data/
  recipes.json       Pangkalan data resepi (sumber utama kandungan)
  categories.json      Senarai kategori
  countries.json         Senarai negara
  communities.json         Senarai kaum/komuniti
  ingredients.json           Senarai bahan untuk carian ikut bahan
```

## Menjalankan Secara Tempatan

Laman ini menggunakan `fetch()` untuk membaca fail JSON, jadi ia perlu dilayan melalui pelayan HTTP tempatan (bukan dibuka terus sebagai fail):

```bash
python3 -m http.server 8000
# atau
npx serve .
```

Kemudian buka `http://localhost:8000` di pelayar.

## Menambah Resepi Baharu

Tiada panel admin pada peringkat ini. Untuk menambah resepi:

1. Buka `data/recipes.json`
2. Tambah objek resepi baharu mengikut struktur sedia ada (rujuk resepi lain sebagai contoh)
3. Pastikan `slug` adalah unik dan mesra URL
4. Letakkan gambar sebenar (jika ada) dalam `assets/images/recipes/` dan kemas kini medan `image`
5. Uji di komputer sebelum push

Medan `emoji` dan `color` digunakan sebagai placeholder visual sehingga gambar sebenar ditambah.

## Hosting

Laman statik ini boleh dihoskan percuma di:

- GitHub Pages
- Cloudflare Pages
- Netlify
- Vercel

Tiada langkah *build* diperlukan — hos terus folder root.

## Roadmap

- **Fasa 1 (semasa)** — MVP: laman resepi, carian, penapis, paparan responsif (~15 resepi contoh, sasaran 100–300)
- **Fasa 2** — SEO & pertumbuhan kandungan: meta tags, structured data, sitemap, URL mesra SEO
- **Fasa 3** — Smart Recipe Search tanpa AI (asas sudah dibina di `search.html`), diperluaskan dengan lebih banyak bahan dan alias

## Prinsip Seni Bina

- HTML mengurus paparan
- CSS mengurus rekaan
- JavaScript mengurus fungsi
- JSON mengurus data resepi (tiada data resepi *hardcode* dalam HTML)
- Git mengurus versi dan penerbitan
