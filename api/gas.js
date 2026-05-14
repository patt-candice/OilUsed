export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const gasUrl = process.env.GAS_WEB_APP_URL;
  if (!gasUrl) {
    return res.status(500).json({
      success: false,
      error: 'ยังไม่ได้ตั้งค่า Environment Variable: GAS_WEB_APP_URL ใน Vercel'
    });
  }

  try {
    const gasRes = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(req.body || {})
    });

    const text = await gasRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({
        success: false,
        error: 'Google Apps Script ไม่ได้ส่ง JSON กลับมา ตรวจสอบว่า Deploy เป็น Web App URL แบบ /exec แล้ว',
        raw: text.slice(0, 500)
      });
    }

    return res.status(gasRes.ok ? 200 : 502).json(data);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || String(err) });
  }
}
