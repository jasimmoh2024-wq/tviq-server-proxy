const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// 📡 🎯 ضع هنا رابط الـ Raw الصافي لملف باقة الـ .ts الجديدة مالتك من غيت هاب عينه بالمليم
const GITHUB_M3U_URL = "https://raw.githubusercontent.com/jasimmoh2024-wq/tv.m3u/refs/heads/main/.gitignore";

// تفعيل ميزة العبور الآمن لكافة المنصات وتطبيقات الأندرويد ستوديو (CORS Enable)
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// 1️⃣ المسار الأول: جلب قائمة القنوات وتفكيكها وإرسالها للتطبيق كـ JSON صافي ومحمي
app.get('/channels', async (req, res) => {
    try {
        const response = await axios.get(GITHUB_M3U_URL);
        const m3uText = response.data;
        const lines = m3uText.split('\n');
        
        let channelsList = [];
        let currentName = "";
        let idCounter = 1;

        const hostUrl = `${req.protocol}://${req.get('host')}`;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith("#EXTINF:")) {
                const parts = line.split(',');
                currentName = parts.length > 1 ? parts[1].trim() : "Premium Channel " + idCounter;
            } else if (line.startsWith("http")) {
                channelsList.push({
                    id: idCounter.toString(),
                    name: currentName || ("Channel " + idCounter),
                    // توليد رابط وسيط مشفر يوجه المشاهد إلى سيرفر ريندر بدلاً من سيرفرك الأصلي
                    proxy_url: `${hostUrl}/stream/${idCounter}?stream_url=${encodeURIComponent(line)}`
                });
                currentName = "";
                idCounter++;
            }
        }
        res.json(channelsList);
    } catch (error) {
        res.status(500).json({ error: "فشل الاتصال بسحابة غيت هاب" });
    }
});

// 2️⃣ المسار الثاني: محرك البث والدرع الحديدي لحقن الهيدرز ومنع كشف المشاهدين وحظر اشتراكك
app.get('/stream/:id', async (req, res) => {
    const targetStreamUrl = req.query.stream_url;
    if (!targetStreamUrl) {
        return res.status(400).send("رابط البث مفقود");
    }

    try {
        // الحركة السرية: إرسال الطلب للسيرفر الرئيسي ببصمة مخصصة تمنع حظر الحساب كلياً
        const streamResponse = await axios({
            method: 'get',
            url: targetStreamUrl,
            responseType: 'stream',
            headers: {
                "Referer": "http://tyqw.site",
                "User-Agent": "LC_CORE_PLAYER/2.1 (Linux; Android 13; Mobile) ExoPlayerLib/2.18.5"
            }
        });

        // تمرير دفق الفيديو لحظياً ورغماً عن قيود المتصفحات
        res.setHeader('Content-Type', streamResponse.headers['content-type'] || 'video/mp2t');
        streamResponse.data.pipe(res);

    } catch (error) {
        res.status(500).send("تعذر إنعاش دفق السيرفر المدفوع الحين");
    }
});

app.listen(PORT, () => {
    console.log(`الترسانة السحابية تعمل بنجاح على بورت: ${PORT}`);
});
