const app = require('./app');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});