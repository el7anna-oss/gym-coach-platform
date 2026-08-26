require('dotenv').config();
const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: '2026-01-01',
  useCdn: false,
  token: process.env.SANITY_SECRET_TOKEN // Requires write token from Sanity management
});

const initialProducts = [
  {
    _type: 'product',
    name: 'Whey Protein Isolate',
    price: 49.99,
    description: 'High-purity micro-filtered protein for lean muscle growth.'
  },
  {
    _type: 'product',
    name: 'Pre-Workout Explosive Energy',
    price: 39.99,
    description: 'Maximum focus and sustained stamina for heavy lifting sessions.'
  }
];

const initialBundles = [
  {
    _type: 'bundle',
    title: 'Elite Hypertrophy 5-Day Program',
    daysPerWeek: 5,
    price: 120.00,
    description: 'Advanced push/pull/legs framework optimized for maximum muscle gains.'
  },
  {
    _type: 'bundle',
    title: 'Shredded Fat-Loss Bootcamp',
    daysPerWeek: 3,
    price: 90.00,
    description: 'High-intensity interval conditioning combined with core macro advisory.'
  }
];

async function seedDatabase() {
  console.log("🌱 Starting Sanity Database Seeding...");
  try {
    for (const item of [...initialProducts, ...initialBundles]) {
      const res = await client.create(item);
      console.log(`Created document: ${res._id} (${res.name || res.title})`);
    }
    console.log("✅ Seeding completed successfully!");
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

seedDatabase();