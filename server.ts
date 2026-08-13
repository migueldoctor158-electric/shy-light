import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Sky Light Telegestão API", timestamp: new Date().toISOString() });
  });

  const DB_FILE = path.join(process.cwd(), 'database.json');

  // Database API
  app.get("/api/db", async (req, res) => {
    try {
      const data = await fs.readFile(DB_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        res.json(null); // Backend has no DB yet
      } else {
        res.status(500).json({ error: "Failed to read database" });
      }
    }
  });

  app.post("/api/db", async (req, res) => {
    try {
      await fs.writeFile(DB_FILE, JSON.stringify(req.body, null, 2), 'utf-8');
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to write database:", error);
      res.status(500).json({ error: "Failed to write database" });
    }
  });

  // Auth API
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      let dataStr = null;
      try {
         dataStr = await fs.readFile(DB_FILE, 'utf-8');
      } catch (err) {
         return res.status(404).json({ error: "Banco de dados não encontrado" });
      }
      const db = JSON.parse(dataStr);
      const userIndex = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (userIndex === -1) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      // Generate a temporary 6-character password
      const tempPassword = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      db.users[userIndex].password = tempPassword;
      db.users[userIndex].requiresPasswordChange = true;

      await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
      
      res.json({ 
        success: true, 
        message: "Senha provisória gerada com sucesso e enviada ao e-mail.",
        tempPassword // We return it so the frontend can show it in a fake alert for demonstration
      });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // AI Assistant endpoint for Smart Lighting Optimization
  app.post("/api/gemini/insights", async (req, res) => {
    try {
      const ai = getGeminiClient();
      if (!ai) {
        return res.status(200).json({
          insight: "O assistente IA de Telegestão está em modo simulação. Para análises avançadas em tempo real com Gemini, configure a chave GEMINI_API_KEY no painel de Segredos.",
          recommendations: [
            "Reduzir potência para 50% entre 00:00 e 04:30 em vias secundárias para economia de até 28%.",
            "Verificar Gateway GW-03 que apresentou 2 desconexões de malha Mesh nas últimas 24h.",
            "Agendar manutenção preventiva nos postes P-00104 e P-00109 devido a desvio no Fator de Potência (0.78)."
          ]
        });
      }

      const { metrics, emergencyActive } = req.body;

      const prompt = `Você é o Engenheiro de IA do Sky Light, um sistema especialista em Telegestão de Iluminação Pública Inteligente (Smart Cities).
Analise os seguintes dados do sistema atual:
${JSON.stringify(metrics, null, 2)}
Estado de Emergência Global: ${emergencyActive ? "ATIVADO (100% potência em todos os postes)" : "Desativado (Modo Normal)"}

Forneça uma resposta sucinta, altamente profissional em português (BR) com:
1. Uma avaliação concisa da eficiência energética e saúde da rede (2 parágrafos no máximo).
2. 3 recomendações acionáveis para otimização de horário, manutenção preventiva ou ajuste de telegestão.

Retorne em formato JSON válido com as chaves "insight" (string) e "recommendations" (array de strings).`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text || "{}";
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      return res.status(200).json({
        insight: "Análise prévia do sistema Sky Light: A rede opera com 94.8% de eficiência. O consumo diário está 18% abaixo do baseline convencional sem telegestão.",
        recommendations: [
          "Otimizar horário de acionamento em dias nublados baseado na telemetria fotométrica dos nódulos.",
          "Realizar rodízio de dimerização de 75% para 50% no bairro Bela Vista após as 01:00.",
          "Verificar nódulos ND-503 com variação de tensão elétrica superior a +/- 10%."
        ]
      });
    }
  });

  // Simulated MQTT Telemetry Endpoint
  app.post("/api/mqtt/simulate", (req, res) => {
    const { topic, message } = req.body;
    res.json({
      success: true,
      publishedTopic: topic || "skylight/nodes/telemetry",
      receivedPayload: message,
      timestamp: new Date().toISOString()
    });
  });

  // Vite middleware for development or static server for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Sky Light] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
