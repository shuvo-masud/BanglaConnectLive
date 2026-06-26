import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const db = new PrismaClient();

app.use(cors());
app.use(express.json());

/* =========================
   EMERGENCY API
========================= */
app.post("/emergency", async (req, res) => {
  try {
    const { message, userId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const emergency = await db.emergencies.create({
      data: {
        message,
        userId: userId || null,
        status: "NEW",
      },
    });

    res.json({ success: true, emergency });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   ADMIN DASHBOARD API
========================= */
app.get("/admin/emergencies", async (req, res) => {
  const emergencies = await db.emergencies.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(emergencies);
});

/* =========================
   START SERVER
========================= */
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
