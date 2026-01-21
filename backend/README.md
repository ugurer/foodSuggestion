# Backend Proxy - Cloudflare Worker

Bu klasör, API key'lerini güvenli tutmak için Cloudflare Workers üzerinde çalışan backend proxy'yi içerir.

## Kurulum

1. Cloudflare hesabı oluştur: https://dash.cloudflare.com/sign-up
2. Wrangler CLI kur: `npm install -g wrangler`
3. Giriş yap: `wrangler login`
4. Environment variable'ları ayarla (Cloudflare Dashboard'dan veya wrangler ile)
5. Deploy et: `wrangler deploy`

## Environment Variables

Cloudflare Dashboard > Workers > food-api > Settings > Variables:

- `GOOGLE_API_KEY`: Google Cloud Console'dan aldığın key (hem Gemini hem Places için geçerli)


## Endpoints

- `POST /api/recommend` - AI yemek önerisi
- `POST /api/places/search` - Restoran arama
- `POST /api/places/nearby` - Yakındaki restoranlar
