const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta de registro SIMPLE (sin controlador ni modelo)
app.post('/api/auth/registrar', (req, res) => {
  console.log('Body recibido:', req.body);
  res.json({ 
    mensaje: 'Ruta funcionando correctamente', 
    datos_recibidos: req.body 
  });
});

app.get('/', (req, res) => {
  res.json({ mensaje: 'Test funcionando' });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.log('❌ Error MongoDB:', err.message));

app.listen(3000, () => console.log('🚀 Servidor TEST en puerto 3000'));