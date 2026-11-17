import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const FALLBACK_BANK = [
  {
    devotion: {
      title: 'Kekuatan di Tengah Badai Kehidupan',
      scripture: 'Markus 4:39',
      content:
        'Ia bangun, menghardik angin itu dan berkata kepada danau itu: "Diam! Tenanglah!" Lalu angin itu reda dan danau itu menjadi teduh sekali. Yesus menyertai perahu kehidupan kita. Apapun badai pergumulan—baik ekonomi, kesehatan, maupun keluarga—Tuhan berkuasa mendatangkan ketenangan.',
      reflection: 'Sudahkah kita menyerahkan kekuatiran kita kepada Tuhan dalam doa hari ini?',
    },
    quiz: {
      question: 'Siapakah yang menenangkan badai di Danau Galilea bersama para murid?',
      options: ['Musa', 'Yesus Kristus', 'Elia', 'Daud'],
      correctAnswerIndex: 1,
      explanation:
        'Yesus Kristus menunjukkan kuasa-Nya atas alam semesta dengan menghardik angin dan danau hingga tenang.',
      bibleReference: 'Markus 4:39',
    },
  },
  {
    devotion: {
      title: 'Kasih yang Menyatukan dan Mengampuni',
      scripture: 'Kolose 3:14',
      content:
        'Dan di atas semuanya itu: kenakanlah kasih, sebagai pengikat yang mempersatukan. Sebagai jemaat GKI Efata Malanu, kasih Kristus adalah dasar persekutuan kita dalam melayani sesama di Klasis Sorong.',
      reflection: 'Bagaimana kita dapat menunjukkan kasih kepada sesama anggota jemaat minggu ini?',
    },
    quiz: {
      question: 'Menurut Surat Kolose 3:14, apakah pengikat yang mempersatukan orang percaya?',
      options: ['Kekayaan', 'Kasih', 'Kecerdasan', 'Kekuasaan'],
      correctAnswerIndex: 1,
      explanation:
        'Kasih adalah pengikat utama yang menyatukan tubuh Kristus dalam ikatan kesempurnaan.',
      bibleReference: 'Kolose 3:14',
    },
  },
  {
    devotion: {
      title: 'Harapan Baru di Setiap Pagi',
      scripture: 'Ratapan 3:22–23',
      content:
        'Tak berkesudahan kasih setia TUHAN, tak habis-habisnya rahmat-Nya, selalu baru tiap pagi; besar kesetiaan-Mu! Setiap hari baru mengingatkan kita akan kesetiaan Allah yang tak pernah gagal.',
      reflection: 'Sebutkan satu berkat baru yang Anda syukuri hari ini.',
    },
    quiz: {
      question: 'Berapa sering rahmat dan kasih setia Tuhan diperbaharui bagi umat-Nya?',
      options: ['Setiap tahun', 'Setiap bulan', 'Tiap pagi', 'Setiap hari sabat'],
      correctAnswerIndex: 2,
      explanation: 'Rahmat Tuhan selalu baru tiap pagi, membuktikan kesetiaan-Nya yang besar.',
      bibleReference: 'Ratapan 3:23',
    },
  },
];

async function startServer() {
  const app = express();
  app.use(express.json());

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  app.post('/api/gemini/quiz-devotion', async (req, res) => {
    try {
      const prompt =
        req.body.prompt ||
        'Berikan Kuis Alkitab interaktif harian (pilihan ganda 4 opsi) dan Renungan Rohani singkat yang mendalam untuk warga jemaat GKI di Tanah Papua dalam bahasa Indonesia yang ramah, hangat, dan teologis.';

      let responseText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: prompt,
          config: {
            systemInstruction:
              'Anda adalah Asisten Teologi dan Pembina Rohani Kristen Protestan (GKI di Tanah Papua). Buatlah Renungan Harian yang menyentuh hati serta Kuis Alkitab interaktif dengan 4 pilihan jawaban, indeks jawaban benar (0-3), penjelasan teologis, dan referensi Alkitab. Berikan hasil dalam format JSON.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                devotion: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    scripture: { type: Type.STRING },
                    content: { type: Type.STRING },
                    reflection: { type: Type.STRING },
                  },
                  required: ['title', 'scripture', 'content', 'reflection'],
                },
                quiz: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    correctAnswerIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                    bibleReference: { type: Type.STRING },
                  },
                  required: [
                    'question',
                    'options',
                    'correctAnswerIndex',
                    'explanation',
                    'bibleReference',
                  ],
                },
              },
              required: ['devotion', 'quiz'],
            },
          },
        });
        responseText = response.text || '';
      } catch (aiErr: any) {
        console.warn('Gemini primary call failed (using fallback bank):', aiErr?.message);
        // Fallback to rotating item from FALLBACK_BANK based on day of year
        const dayOfYear = Math.floor(
          (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
        );
        const fallbackItem = FALLBACK_BANK[dayOfYear % FALLBACK_BANK.length];
        return res.json({ ok: true, data: fallbackItem });
      }

      const data = JSON.parse(responseText || '{}');
      if (!data.devotion || !data.quiz) {
        throw new Error('Invalid JSON structure from model');
      }
      res.json({ ok: true, data });
    } catch (error: any) {
      console.error('Gemini Quiz API error:', error);
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
      );
      const fallbackItem = FALLBACK_BANK[dayOfYear % FALLBACK_BANK.length];
      res.json({ ok: true, data: fallbackItem });
    }
  });

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
    },
  });
  app.use(vite.middlewares);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer();
