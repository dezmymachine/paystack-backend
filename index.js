require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
//app.use(cors());
app.use(cors({ credentials: true, origin: "https://deperfectgroupe.com/" }))
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Paystack Backend API is running!' });
});

// Initialize payment endpoint
app.post('/initialize-payment', async (req, res) => {
  try {
    console.log('Initializing payment for:', req.body.email);

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: req.body.email,
        amount: req.body.amount,
        currency: 'GHS',
        callback_url: req.body.callback_url,
        channels: ['mobile_money'],
        metadata: req.body.metadata,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Paystack API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Payment initialized successfully:', data.data?.reference);
    res.json(data);

  } catch (error) {
    console.error('Payment initialization error:', error.message);
    res.status(500).json({
      error: 'Payment initialization failed',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});
