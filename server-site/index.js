const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

// Setup PostgreSQL pool and Prisma adapter for Prisma v7
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();

app.use(cors());
app.use(express.json());

// Register Route
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log("Register payload received:", req.body);
    const { email, password, phone, address } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, error: "User already exists with this email" });
    }

    const user = await prisma.user.create({ 
      data: { email, password, phone, address } 
    });
    
    console.log("User successfully created:", user.id);
    res.json({ success: true, user });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login Route (With JWT Token Generation)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    
    // Create a JWT token valid for 7 days
    const token = jwt.sign(
      { userId: user.id, email: user.email }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    console.log("User logged in successfully:", user.id);
    res.json({ success: true, token, user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Save Order / Cart Route (Protected by JWT Token)
app.post('/api/orders', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ success: false, error: "No token provided, unauthorized" });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userId = decoded.userId; 

    // Verify user exists in the database before creating an order
    const userExists = await prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      return res.status(401).json({ 
        success: false, 
        error: "Session expired or user not found. Please log in again." 
      });
    }

    const { items, totalPrice } = req.body;
    
    const order = await prisma.order.create({
      data: {
        userId,
        totalPrice: parseFloat(totalPrice),
        items: {
          create: items.map(item => {
            console.log("Incoming cart item object:", JSON.stringify(item));

            const rawTitle = item.title || item.name || item.product?.title || item.productName || "";
            const titleText = rawTitle.trim().toLowerCase();

            const rawType = item.type || item.itemType || item.category || item.product?.type || "";
            const typeText = rawType.trim().toLowerCase();

            const isBundleKeyword = 
              titleText.includes('bundle') || 
              titleText.includes('session') || 
              titleText.includes('training') ||
              titleText.includes('class') ||
              titleText.includes('package') ||
              titleText.includes('membership') ||
              titleText.includes('coach') ||
              titleText.includes('pass') ||
              typeText.includes('bundle') ||
              typeText.includes('session') ||
              typeText.includes('training') ||
              typeText.includes('class') ||
              typeText.includes('package') ||
              typeText.includes('membership') ||
              typeText.includes('coach') ||
              typeText.includes('pass');

            let determinedItemType = 'Shop';
            if (isBundleKeyword || typeText === 'bundle') {
              determinedItemType = 'Bundle';
            }

            return {
              productId: String(item._id || item.id || item.productId || 'unknown'),
              title: rawTitle || "Untitled Product",
              itemType: determinedItemType,
              price: parseFloat(item.price || 0),
              quantity: parseInt(item.quantity || 1),
              imageUrl: item.imageUrl || item.image || item.product?.imageUrl || null
            };
          })
        }
      },
      include: { items: true }
    });

    console.log("Order successfully created:", order.id);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));