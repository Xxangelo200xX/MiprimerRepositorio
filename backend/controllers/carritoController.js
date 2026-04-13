const Carrito = require('../models/Carrito');

// Obtener carrito del usuario
const getCarrito = async (req, res) => {
  try {
    let carrito = await Carrito.findOne({ usuario: req.user.id }).populate('productos.producto');
    if (!carrito) {
      carrito = new Carrito({ usuario: req.user.id, productos: [] });
      await carrito.save();
    }
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Agregar producto al carrito
const agregarAlCarrito = async (req, res) => {
  try {
    const { productoId, cantidad } = req.body;
    let carrito = await Carrito.findOne({ usuario: req.user.id });
    
    if (!carrito) {
      carrito = new Carrito({ usuario: req.user.id, productos: [] });
    }
    
    const productoExistente = carrito.productos.find(p => p.producto.toString() === productoId);
    if (productoExistente) {
      productoExistente.cantidad += cantidad || 1;
    } else {
      carrito.productos.push({ producto: productoId, cantidad: cantidad || 1 });
    }
    
    await carrito.save();
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar producto del carrito
const eliminarDelCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario: req.user.id });
    if (!carrito) return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    
    carrito.productos = carrito.productos.filter(p => p.producto.toString() !== req.params.productoId);
    await carrito.save();
    res.json(carrito);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Vaciar carrito
const vaciarCarrito = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario: req.user.id });
    if (!carrito) return res.status(404).json({ mensaje: 'Carrito no encontrado' });
    
    carrito.productos = [];
    await carrito.save();
    res.json({ mensaje: 'Carrito vaciado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = { getCarrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito };