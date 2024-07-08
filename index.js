const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://queryhelpdesk-frontend.vercel.app'
  ],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
