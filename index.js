import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchAndProcessOrders } from './utils/api.js';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint for the frontend to fetch orders
app.get('/api/orders', async (req, res) => {
  try {
    const { status, initial_date, final_date } = req.query;
    const orders = await fetchAndProcessOrders({ status, initial_date, final_date });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching or processing orders:', error);
    res.status(500).json({ error: 'Falha ao buscar os pedidos.', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
