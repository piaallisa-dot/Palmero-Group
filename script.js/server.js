import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const allowedOrigins = new Set([
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "http://127.0.0.1:5501",
  "http://localhost:5501",
  "http://127.0.0.1:5502",
  "http://localhost:5502"
]);

app.use(cors({
  origin(origin, callback) {
    // Allow requests from local tools (and curl/Postman with no Origin).
    if (!origin || allowedOrigins.has(origin) || /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  }
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    status: "success",
    message: "FishMarket Connect backend is running.",
    chatbotConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "your_api_key_here")
  });
});


// LOCAL FALLBACK CHATBOT (works without OpenAI credits)
function localChatReply(message, context = {}) {
  const q = String(message || "").toLowerCase();
  const fishPrices = Array.isArray(context.fishPrices) ? context.fishPrices : [];
  const buyers = Array.isArray(context.buyers) ? context.buyers : [];
  const reports = Array.isArray(context.reports) ? context.reports : [];

  const money = value => `₱${Number(value).toLocaleString("en-PH")}`;
  const fishNames = [...new Set(fishPrices.map(row => row.fish).filter(Boolean))];
  const matchedFish = fishNames.find(name => q.includes(String(name).toLowerCase()));
  const isPriceQuery = /price|presyo|magkano|cost|rate|market|compare|comparison|highest|lowest|mahal|mura/.test(q);
  const available = buyers.filter(b => String(b.status || "").toLowerCase() === "available");
  const unavailable = buyers.filter(b => String(b.status || "").toLowerCase() === "unavailable");

  if (/^(hi|hello|hey|good morning|good afternoon|good evening|kumusta|kamusta)\b/.test(q)) {
    return "Hello! I'm FishMarket Connect's local assistant. You can ask me about fish prices, market comparisons, available buyers, reports, or how to use the system.";
  }

  if (/help|what can you|how to use|features|ano.*(pwede|function)|tulong/.test(q)) {
    return "I can help using the information currently stored in FishMarket Connect: (1) fish prices and market comparisons, (2) listed buyers and their availability, (3) recent catch reports, and (4) basic system navigation. Ask a specific question, such as “What is the price of Bangus in Batangas?”";
  }

  if (/buyer|buyers|casa|buying station|available|availability|sino.*(buyer|bumibili)/.test(q)) {
    if (/unavailable|not available|hindi available/.test(q)) {
      return unavailable.length
        ? `Currently marked unavailable (${unavailable.length}):\n${unavailable.map(b => `• ${b.name} — ${b.address || "Address not listed"}`).join("\n")}`
        : "No buyers are currently marked Unavailable in the saved system data.";
    }
    if (available.length) {
      return `Buyers currently marked Available (${available.length}):\n${available.map(b => `• ${b.name} — ${b.address || "Address not listed"}${b.type ? ` (${b.type})` : ""}`).join("\n")}\n\nAvailability is based on the status shown in your system and should be confirmed directly with the buyer.`;
    }
    return "I couldn't find buyer records in the data sent to me. Check the Buyers/Casas page.";
  }

  if (/report|catch|harvest|analytics|record|submission/.test(q)) {
    if (!reports.length) return "There are no catch reports in the data currently provided to the chatbot. You can add reports through the Report page.";
    const count = reports.length;
    const latest = reports.slice(-3).reverse();
    const details = latest.map(r => {
      const parts = [];
      if (r.fish) parts.push(`Fish: ${r.fish}`);
      if (r.quantity != null) parts.push(`Quantity: ${r.quantity}`);
      if (r.location) parts.push(`Location: ${r.location}`);
      if (r.date) parts.push(`Date: ${r.date}`);
      return parts.length ? `• ${parts.join(" | ")}` : `• ${JSON.stringify(r)}`;
    }).join("\n");
    return `I can see ${count} recent report record(s) in the data provided.\n${details}\nFor complete analytics, open the Analytics page in the system.`;
  }

  if (matchedFish) {
    const matches = fishPrices.filter(row => String(row.fish).toLowerCase() === matchedFish.toLowerCase());
    if (!matches.length) return `I couldn't find price records for ${matchedFish}.`;
    const lines = matches.map(row => `• ${row.market}: ${money(row.price)}${row.status ? ` (${row.status})` : ""}`);
    const highest = matches.reduce((a, b) => Number(a.price) >= Number(b.price) ? a : b);
    const lowest = matches.reduce((a, b) => Number(a.price) <= Number(b.price) ? a : b);
    return `${matchedFish} prices in the available records:\n${lines.join("\n")}\n\nHighest listed: ${highest.market} at ${money(highest.price)}.\nLowest listed: ${lowest.market} at ${money(lowest.price)}.\nThese are system reference/listed prices, not guaranteed real-time quotations.`;
  }

  if (/highest|most expensive|pinakamahal|mahal/.test(q) && fishPrices.length) {
    const highest = fishPrices.reduce((a, b) => Number(a.price) >= Number(b.price) ? a : b);
    return `Highest listed fish-price record: ${highest.fish} in ${highest.market} at ${money(highest.price)}. ${highest.status ? `Status: ${highest.status}.` : ""} This is based only on the current records in the system.`;
  }
  if (/lowest|cheapest|pinakamura|mura/.test(q) && fishPrices.length) {
    const lowest = fishPrices.reduce((a, b) => Number(a.price) <= Number(b.price) ? a : b);
    return `Lowest listed fish-price record: ${lowest.fish} in ${lowest.market} at ${money(lowest.price)}. ${lowest.status ? `Status: ${lowest.status}.` : ""} This is based only on the current records in the system.`;
  }
  if (/price|presyo|magkano|market|fish|isda/.test(q) && fishPrices.length) {
    const uniqueMarkets = [...new Set(fishPrices.map(r => r.market).filter(Boolean))];
    const fishList = fishNames.join(", ");
    return `The system currently contains ${fishPrices.length} fish-price records across ${uniqueMarkets.join(", ")}. Fish listed: ${fishList}.\n\nPlease ask for a specific fish and market (example: “Compare Tilapia prices”) so I can give you the matching records. Prices are references and may need local verification.`;
  }

  return "I'm running in local/offline mode because the OpenAI API is unavailable or has no credits. I can answer from the system data about fish prices, buyers and availability, and catch reports. Try asking a specific question, such as “Compare Bangus prices” or “Which buyers are available?”";
}

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const { message, history = [], context = "" } = req.body ?? {};

  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "Please enter a message." });
  }
  if (message.length > 4000) {
    return res.status(400).json({ success: false, error: "Message is too long." });
  }

  const contextObject = typeof context === "string"
    ? (() => { try { return JSON.parse(context); } catch { return {}; } })()
    : (context || {});

  if (!apiKey || apiKey === "your_api_key_here") {
    return res.json({
      success: true,
      fallbackMode: true,
      reply: localChatReply(message, contextObject)
    });
  }

  try {

    const safeHistory = Array.isArray(history)
      ? history.slice(-10).filter(item =>
          item && ["user", "assistant"].includes(item.role) && typeof item.content === "string"
        )
      : [];

    // Accept either a JSON string or an object from the frontend.
    const contextText = typeof context === "string" ? context : JSON.stringify(context ?? {});
    const safeContext = contextText.slice(0, 8000);

    const instructions = `You are the FishMarket Connect AI Assistant.

Help users understand fish prices, compare markets, find listed buyers, and understand catch reports and analytics. Use the application data below. Do not invent prices, buyer details, or report information. Explain when information is missing. Prices are in Philippine pesos (PHP). Clearly say when prices are estimates or references rather than guaranteed current prices. Reply in English or Taglish based on the user's language.

APPLICATION DATA:
${safeContext}`;

    const openai = new OpenAI({ apiKey });
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-4.1",
      instructions,
      input: [
        ...safeHistory.map(item => ({ role: item.role, content: item.content })),
        { role: "user", content: message.trim() }
      ],
      max_output_tokens: 700
    });

    return res.json({
      success: true,
      reply: response.output_text || "Sorry, I could not generate a response."
    });
  } catch (error) {
    console.error("Chatbot API unavailable; using local fallback:", error?.status || error?.code || error?.message);
    return res.json({
      success: true,
      fallbackMode: true,
      reply: localChatReply(message, contextObject)
    });
  }
});

app.listen(PORT, () => {
  console.log(`FishMarket Connect backend running at http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your_api_key_here") {
    console.log("AI chatbot is not configured yet. Add your API key to .env to enable it.");
  }
});
