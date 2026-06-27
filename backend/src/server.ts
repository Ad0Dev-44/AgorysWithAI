import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// A basic health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Backend server is running smoothly!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is blasting off on http://localhost:${PORT}`);
});