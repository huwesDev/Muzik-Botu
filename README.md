# 🎵 Discord Müzik Botu

YouTube ve Spotify destekli, kesintisiz çalışan Discord müzik botu.  
**Discord.js v14** + **DisTube v5** ile geliştirilmiştir.

---

## ✨ Özellikler

- 🔴 **YouTube** — link, arama, playlist
- 🎧 **Spotify** — şarkı, albüm, playlist, artist
- 🔶 SoundCloud ve 700+ site desteği
- ⏸️ Duraklat / Devam / Atla / Önceki
- 📋 Sayfalı kuyruk görünümü
- 🎛️ 20+ ses filtresi (Nightcore, Bass Boost, 8D…)
- 🔁 Tekrar modu (kapalı / şarkı / kuyruk)
- 🔀 Kuyruk karıştırma
- ⏩ Konuma atlama (seek)
- 🔄 Otoplay (ilgili şarkı önerisi)
- 🔊 Ses seviyesi kontrolü (1-200)
- 🎮 Buton kontrolleri (oynat/duraklat/atla/dur/karıştır/tekrar)
- 📱 Slash komutları (`/`)

---

## 📁 Proje Yapısı

```
music/
├── src/
│   ├── commands/
│   │   └── music/
│   │       ├── play.js
│   │       ├── skip.js
│   │       ├── stop.js
│   │       ├── pause.js
│   │       ├── resume.js
│   │       ├── queue.js
│   │       ├── nowplaying.js
│   │       ├── volume.js
│   │       ├── shuffle.js
│   │       ├── repeat.js
│   │       ├── seek.js
│   │       ├── remove.js
│   │       ├── filter.js
│   │       ├── search.js
│   │       ├── join.js
│   │       ├── leave.js
│   │       ├── autoplay.js
│   │       ├── previous.js
│   │       └── help.js
│   ├── events/
│   │   └── ready.js
│   ├── handlers/
│   │   ├── commandHandler.js
│   │   ├── eventHandler.js
│   │   └── distubeHandler.js
│   ├── utils/
│   │   └── helpers.js
│   └── index.js
├── .env              ← Kendi bilgilerini buraya yaz
├── .env.example      ← Şablon
├── .gitignore
└── package.json
```

---

## ⚙️ Kurulum

### 1. Gereksinimler

- [Node.js](https://nodejs.org/) **v18+** → [İndir](https://nodejs.org/)

> **FFmpeg ve yt-dlp kurmanı gerekmez.**  
> `ffmpeg-static` ve `@distube/yt-dlp` paketleri `npm install` ile otomatik gelir.  
> Sadece Node.js yeterli.

> **Not:** Bazı durumlarda sistem `yt-dlp`'si daha güncel olduğu için ses sorunu yaşanabilir.  
> Sorun çıkarsa aşağıdaki şekilde sisteme de kurabilirsin:
> ```powershell
> winget install yt-dlp.yt-dlp
> ```

---

### 2. Discord Bot Oluştur

1. [Discord Developer Portal](https://discord.com/developers/applications) → **New Application**
2. Sol menü → **Bot** → **Add Bot**
3. **Token**'ı kopyala → `.env`'ye yaz
4. Sol menü → **General Information** → **Application ID**'yi kopyala → `.env`'ye yaz
5. **Bot** sekmesi → şunları aç:
   - ✅ `SERVER MEMBERS INTENT`
   - ✅ `MESSAGE CONTENT INTENT`
6. **OAuth2 → URL Generator** → `bot` + `applications.commands` seç  
   Bot izinleri: `Connect`, `Speak`, `Send Messages`, `Embed Links`, `Read Message History`  
   Oluşan linki tarayıcıda aç → sunucuna ekle

---

### 3. Spotify API Anahtarı Al

1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) → **Create App**
2. App adı/açıklaması gir, **Redirect URI** olarak `http://localhost` yaz
3. **Client ID** ve **Client Secret**'ı kopyala → `.env`'ye yaz

---

### 4. .env Dosyasını Doldur

`.env.example` dosyasını kopyalayarak `.env` oluştur:

```powershell
Copy-Item .env.example .env
```

Ardından `.env` içini doldur:

```env
TOKEN=MTEx...             # Discord bot token
CLIENT_ID=123456...       # Discord uygulama ID
GUILD_ID=987654...        # (isteğe bağlı) test sunucusu ID

SPOTIFY_CLIENT_ID=abc...
SPOTIFY_CLIENT_SECRET=xyz...

DEFAULT_VOLUME=80
LEAVE_ON_EMPTY_COOLDOWN=30000
LEAVE_ON_FINISH_COOLDOWN=30000
```

---

### 5. Bağımlılıkları Yükle ve Çalıştır

```powershell
npm install
npm start
```

Geliştirme modunda (otomatik yeniden başlatma):
```powershell
npm run dev
```

---

## 🎮 Komutlar

| Komut | Açıklama |
|-------|----------|
| `/play [sorgu]` | YouTube / Spotify şarkı, playlist çal |
| `/search [sorgu]` | YouTube'da ara, listeden seç |
| `/nowplaying` | Çalan şarkı + ilerleme çubuğu |
| `/queue [sayfa]` | Kuyruğu göster (sayfalı) |
| `/skip [adet]` | Şarkı atla |
| `/previous` | Önceki şarkıya dön |
| `/pause` | Duraklat |
| `/resume` | Devam et |
| `/stop` | Kapat ve kuyruğu temizle |
| `/seek [zaman]` | Konuma atla (`1:30` veya `90`) |
| `/volume [seviye]` | Ses seviyesi (1-200) |
| `/shuffle` | Kuyruğu karıştır |
| `/repeat [mod]` | Tekrar modu |
| `/remove [pozisyon]` | Kuyruktaki şarkıyı sil |
| `/filter [filtre]` | Ses filtresi uygula/kaldır |
| `/autoplay` | Otoplay aç/kapat |
| `/join` | Ses kanalına katıl |
| `/leave` | Kanaldan ayrıl |
| `/help` | Tüm komutları göster |

---

## 🎛️ Ses Filtreleri

`/filter` komutuyla uygulayabilirsin:

`bassboost` · `nightcore` · `8D` · `vaporwave` · `echo` · `karaoke`  
`3d` · `surround` · `vibrato` · `reverse` · `superbass` · `treble` · ve daha fazlası

---

## 🔧 Sorun Giderme

**"sign in" / 429 hatası**  
YouTube bot trafiğini kısıtlıyor. yt-dlp'nin güncel olduğundan emin ol:
```powershell
yt-dlp -U
```

**Slash komutlar görünmüyor**  
`.env`'de `GUILD_ID` doluysa o sunucuda anında görünür.  
Boşsa global kayıt 1 saate kadar sürebilir.

**Ses gelmiyor**  
FFmpeg'in PATH'te olduğunu kontrol et:
```powershell
ffmpeg -version
```

---

## 📜 Lisans

MIT
