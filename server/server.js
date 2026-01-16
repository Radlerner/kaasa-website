const express = require("express");
const cors = require("cors");

const app = express();

// CORS: genspark 프론트 허용
app.use(cors({
  origin: ["https://www.genspark.ai"],
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

// (임시) 로그인 엔드포인트 - CORS/연결 확인용
app.post("/api/auth/login", (req, res) => {
  res.status(200).json({ ok: true, message: "login endpoint reachable" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("KAASA backend running on port", PORT);
});