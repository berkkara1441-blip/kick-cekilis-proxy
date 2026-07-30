// GET /api/kick-channel?slug=<kick_kullanici_adi>
//
// Tarayıcıdan doğrudan kick.com/api/v2/channels/{slug} çağrısı çoğu zaman
// CORS/Cloudflare tarafından engelleniyor. Bu fonksiyon aynı isteği SUNUCUDAN
// atar (CORS diye bir kavram sunucular arasında yok) ve sonucu, siteye
// CORS izni vererek geri döner.
//
// Not: Bu, Kick'in resmi OAuth API'si DEĞİL — resmi API chatroom ID'yi
// döndürmüyor. Bu yüzden burada client_id/client_secret kullanmıyoruz;
// gerek yok. Sadece isteğin kaynağını tarayıcıdan sunucuya taşıyoruz.

module.exports = async (req, res) => {
  // Kendi sitenden (veya herhangi bir yerden) çağrılabilsin diye CORS izni.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const slug = (req.query.slug || '').toString().trim().toLowerCase();
  if (!slug || !/^[a-z0-9_-]+$/i.test(slug)) {
    res.status(400).json({ error: 'Geçersiz veya eksik slug parametresi.' });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const upstream = await fetch(`https://kick.com/api/v2/channels/${encodeURIComponent(slug)}`, {
      headers: {
        'Accept': 'application/json',
        // Kick'in Cloudflare koruması tarayıcı benzeri isteklere daha yumuşak davranıyor.
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Kick yanıtı: HTTP ${upstream.status}` });
      return;
    }

    const data = await upstream.json();
    const chatroomId = data && data.chatroom && data.chatroom.id;

    if (!chatroomId) {
      res.status(404).json({ error: 'chatroom id bulunamadı — kullanıcı adını kontrol et.' });
      return;
    }

    res.status(200).json({
      slug,
      chatroomId,
      avatarUrl: (data.user && data.user.profilepic) || null,
      isLive: !!data.livestream,
    });
  } catch (err) {
    const message = err.name === 'AbortError' ? 'Kick yanıt vermedi (zaman aşımı).' : (err.message || 'Bilinmeyen hata');
    res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
};
