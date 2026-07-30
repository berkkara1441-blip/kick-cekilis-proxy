# Kick Çekiliş — Backend Proxy

Bu, tek bir dosyadan (`api/kick-channel.js`) oluşan minimal bir Vercel projesi.
Amacı: `kick.com/api/v2/channels/{slug}` isteğini tarayıcı yerine sunucudan
atıp CORS/engelleme sorununu çözmek. **client_id / client_secret gerekmiyor.**

## Kurulum (5 dakika)

1. Bu klasörü kendi GitHub reponda bir yere koy (veya Vercel CLI ile doğrudan deploy et).
2. [vercel.com](https://vercel.com) üzerinde "New Project" ile bu klasörü import et.
   - Ekstra ayar gerekmiyor, Vercel `api/` klasörünü otomatik algılar.
3. Deploy tamamlanınca sana bir adres verecek, örn:
   `https://kick-cekilis-proxy.vercel.app`
4. Test etmek için tarayıcıda şunu aç (kendi kullanıcı adınla):
   `https://kick-cekilis-proxy.vercel.app/api/kick-channel?slug=xqc`
   Şöyle bir yanıt görmelisin:
   ```json
   {"slug":"xqc","chatroomId":668,"avatarUrl":"https://...","isLive":true}
   ```

## Siteye bağlama

Ana HTML dosyasında (`ShuryÇekiliş.html`) en üstte şu satırı bulup
kendi Vercel adresinle değiştir:

```js
const KICK_PROXY_BASE = 'https://kick-cekilis-proxy.vercel.app';
```

Eğer HTML dosyasını da aynı Vercel projesine (aynı domain'e) koyarsan,
bu değeri boş string `''` bırakabilirsin — o zaman istekler otomatik
olarak aynı adrese gider.

## Notlar

- Bu proxy hâlâ Kick'in resmi olmayan (browser) API'sini kullanıyor,
  sadece isteği sunucudan atıyor. Kick ileride bu uç noktayı yine
  engelleyebilir — o yüzden sitedeki "chatroom ID'yi manuel gir"
  yedek seçeneği olduğu gibi kalsın, dokunmadım.
- İleride resmi OAuth API'sini (chat mesajı gönderme, abone webhook'ları
  gibi) kullanmak istersen, o zaman gerçekten `client_id`/`client_secret`
  gerekecek — o ayrı bir iş, istersen onu da konuşuruz.
