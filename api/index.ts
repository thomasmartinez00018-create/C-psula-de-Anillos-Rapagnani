import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Meta CAPI endpoint
app.post("/api/meta-event", async (req, res) => {
  const { eventName, eventData, userData } = req.body;
  const pixelId = process.env.VITE_META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.error("Meta credentials missing in environment");
    return res.status(500).json({ error: "Meta credentials missing" });
  }

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            user_data: {
              client_ip_address: req.ip,
              client_user_agent: req.headers["user-agent"],
              ...userData,
            },
            custom_data: eventData,
          },
        ],
        access_token: accessToken,
      }
    );
    res.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error("Meta CAPI Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to send event to Meta" });
  }
});

export default app;
