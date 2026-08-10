import app from "./app";

const PORT = process.env.AI_SERVICE_PORT || 5001;

app.listen(PORT, () => {
  console.log(`[ai-service] running on http://localhost:${PORT}`);
});
