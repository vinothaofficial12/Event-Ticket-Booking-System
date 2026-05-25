import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import { Server } from "socket.io";
import { createServer } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Nodemailer with provided Gmail credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER || "vinothaofficial12@gmail.com",
    pass: process.env.GMAIL_PASS || "nnyt spjq gsls itao"
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;
  const httpServer = createServer(app);
  
  // Initialize Socket.io
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);
    
    socket.on("attendance_change", (data) => {
      console.log(`[SOCKET] Attendance update received:`, data);
      // Broadcast to all other clients
      socket.broadcast.emit("attendance_updated", data);
    });

    socket.on("new_booking", (data) => {
      console.log(`[SOCKET] New booking received:`, data);
      socket.broadcast.emit("booking_added", data);
    });

    socket.on("disconnect", () => {
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });
  });

  app.use(express.json());

  // Professional Notification API
  app.post("/api/notify", async (req, res) => {
    const { name, email, phone, eventName, bookingId } = req.body;
    
    console.log(`[BACKEND] Processing automated dispatch for ${name} (${bookingId})`);
    
    try {
      // 1. Send Real Email
      const mailOptions = {
        from: '"VS TECH Events" <vinothaofficial12@gmail.com>',
        to: email,
        subject: `Booking Confirmed: ${eventName} - VS TECH`,
        text: `Hello ${name},\n\nYour spot is reserved for ${eventName} at VS TECH!\n\nBooking ID: ${bookingId}\n\nKindly reach the venue 15 mins before. We have attached your digital confirmation to this email.\n\nThank you for choosing VS TECH!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; padding: 24px;">
            <h2 style="color: #2563eb;">Booking Confirmed!</h2>
            <p>Hello <strong>${name}</strong>,</p>
            <p>Your spot is successfully reserved for <strong>${eventName}</strong>.</p>
            <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Booking ID</p>
              <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: bold; color: #111827;">${bookingId}</p>
            </div>
            <p>Please arrive 15 minutes before the start time. Present this email or your WhatsApp confirmation at the door.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9ca3af;">This is an automated notification from the VS TECH Event University Hub.</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`[SUCCESS] Real Email dispatched to: ${email}`);

      // 2. Simulate WhatsApp (requires Meta API key / Twilio)
      console.log(`[SIMULATION] WhatsApp message queued for: ${phone}`);
      await new Promise(resolve => setTimeout(resolve, 800));

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        dispatched: ["email", "whatsapp_simulated"],
        provider: "University Cloud Notification Hub"
      });
    } catch (error) {
      console.error("[ERROR] Failed to send notification:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Notification failed" 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`[System] Professional Notification & Real-time Hub Loaded`);
  });
}

startServer();
