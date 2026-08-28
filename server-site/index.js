const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@sanity/client');
const OpenAI = require('openai');

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2026-01-01',
  useCdn: false,
  token: process.env.SANITY_SECRET_TOKEN
});

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://gym-coach-platform-3rchi6guq-ritness-team.vercel.app',
  'https://gym-coach-platform-13ez9v6tp-ritness-team.vercel.app',
  'https://gym-coach-platform-chi.vercel.app',
  'https://gym-coach-platform.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, phone, address } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists with this email" });
    }
    const user = await prisma.user.create({ data: { email, password, phone, address } });
    res.json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Dedicated AI Nutrition Room Route (OpenAI-Powered Conversational Nutritionist)
app.post('/api/ai-nutrition', async (req, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) return res.status(400).json({ success: false, error: 'Prompt is required' });

    const systemInstruction = {
      role: "system",
      content: `You are an elite sports nutritionist and AI fitness consultant inside the "Nutrition Room". 
      Your task is to converse with the client, extract their key metrics (Gender, Weight, Height, and Goal), and provide a fully customized nutrition recommendation. 
      When you have enough details from the conversation, structure your final output clearly with:
      - Daily Caloric Target
      - Macronutrient Breakdown (Protein, Carbs, Fats in grams)
      - Recommended Meal Timing & Dietary Strategy`
    };

    const formattedMessages = [
      systemInstruction,
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: prompt }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: formattedMessages,
      temperature: 0.7,
    });

    res.json({
      success: true,
      reply: completion.choices[0].message.content
    });

  } catch (err) {
    console.error("AI Nutrition Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save Order / Cart Route
app.post('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ success: false, error: "No token provided, unauthorized" });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId; 

    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) return res.status(401).json({ success: false, error: "Session expired." });

    const { items, totalPrice } = req.body;
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice: parseFloat(totalPrice),
        items: {
          create: items.map(item => ({
            productId: String(item._id || item.id || 'unknown'),
            title: item.title || "Untitled Product",
            itemType: item.itemType === 'bundle' ? 'Bundle' : 'Shop',
            price: parseFloat(item.price || 0),
            quantity: parseInt(item.quantity || 1),
            imageUrl: item.imageUrl || null
          }))
        }
      },
      include: { items: true }
    });

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));