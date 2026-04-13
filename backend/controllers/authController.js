const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

const registrar = async (req, res) => {
  try {
    console.log('📝 Body recibido:', req.body);
    
    const { nombre, email, password, rol } = req.body;
    
    // Verificar si ya existe
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    
    // Crear usuario
    const usuario = new Usuario({ nombre, email, password, rol: rol || 'usuario' });
    await usuario.save();
    
    res.status(201).json({ 
      mensaje: '✅ Usuario registrado exitosamente',
      usuario: { id: usuario._id, nombre, email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log('🔐 Login intento:', req.body.email);
    
    const { email, password } = req.body;
    
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' });
    }
    
    const valido = await usuario.compararPassword(password);
    if (!valido) {
      return res.status(400).json({ mensaje: 'Email o contraseña incorrectos' });
    }
    
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      mensaje: '✅ Login exitoso',
      token,
      usuario: { id: usuario._id, nombre: usuario.nombre, email, rol: usuario.rol }
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// Verificar que las funciones existen
console.log('✅ authController cargado:', { registrar: typeof registrar, login: typeof login });

module.exports = { registrar, login };