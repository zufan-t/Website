const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');

const app = express();

const corsOptions = {
    origin: [
        'http://localhost',
        'http://127.0.0.1',
        'http://localhost:3000',
        'https://zufan-t.github.io'
    ],
};
app.use(cors(corsOptions));
app.use(express.json());


const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: { error: "Terlalu banyak request. Silakan tunggu 1 menit lagi." },
    standardHeaders: true,
    legacyHeaders: false,
});

// console.log("Using API Key starting with:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 8) + "..." : "undefined");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/api/generate-soal', limiter, async (req, res) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            Buatlah 1 soal matematika aljabar setingkat SMP kelas 8(tentang gradien atau persamaan garis) dengan konteks rute bus Trans Semarang atau jalan raya di kota Semarang.
            Angka-angkanya harus acak dan masuk akal.
            
            KEMBALIKAN HANYA FORMAT JSON MURNI TANPA MARKDOWN.
            Struktur JSON wajib seperti ini:
            {
              "pertanyaan": "teks soal di sini",
              "pilihan": ["opsi 1", "opsi 2", "opsi 3", "opsi 4"],
              "jawaban_benar": "teks jawaban yang benar"
            }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanJsonText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const dataSoal = JSON.parse(cleanJsonText);

        res.json(dataSoal);

    }
    catch (error) {
        console.error("===== INFO DARI GOOGLE GEMINI =====");
        console.error(error.message);
        console.error("===================================");

        res.status(500).json({ error: "API Google sedang limit/sibuk. Tunggu 1 menit ya." });
        // catch (error) {
        //     console.error("Error detail:", error);
        //     if (error.response) {
        //         console.error("Error response data:", await error.response.text());
        //     }
        //     res.status(500).json({ error: "Gagal membuat soal." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend Server berjalan di http://localhost:${PORT}`);
});