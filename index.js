const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors({
  origin: 'https://queryhelpdesk-frontend.vercel.app'
}));

app.get('/hello', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});
