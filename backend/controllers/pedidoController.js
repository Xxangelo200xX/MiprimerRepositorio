const Pedido = require('../models/Pedido');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

// Crear pedido desde el carrito (CON ACTUALIZACIÓN DE STOCK)
const crearPedido = async (req, res) => {
  try {
    const carrito = await Carrito.findOne({ usuario: req.user.id }).populate('productos.producto');
    
    if (!carrito || carrito.productos.length === 0) {
      return res.status(400).json({ mensaje: 'El carrito está vacío' });
    }
    
    let total = 0;
    const productosPedido = [];
    
    // Verificar stock disponible y actualizar
    for (const item of carrito.productos) {
      const producto = item.producto;
      const cantidad = item.cantidad;
      
      // Verificar stock
      if (producto.stock < cantidad) {
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${cantidad}`
        });
      }
      
      // Actualizar stock del producto
      producto.stock -= cantidad;
      await producto.save();
      
      total += producto.precio * cantidad;
      productosPedido.push({
        producto: producto._id,
        cantidad: cantidad,
        precio: producto.precio
      });
    }
    
    // Crear pedido
    const pedido = new Pedido({
      usuario: req.user.id,
      productos: productosPedido,
      total,
      estado: 'pendiente'
    });
    
    await pedido.save();
    
    // Vaciar carrito
    carrito.productos = [];
    await carrito.save();
    
    res.status(201).json({ 
      mensaje: '✅ Pedido creado exitosamente',
      pedido: {
        id: pedido._id,
        total: pedido.total,
        estado: pedido.estado
      }
    });
  } catch (error) {
    console.error('Error al crear pedido:', error);
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

// Obtener mis pedidos (usuario normal)
const getMisPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find({ usuario: req.user.id })
      .populate('productos.producto')
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener todos los pedidos (solo admin)
const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.find()
      .populate('usuario', 'nombre email')
      .populate('productos.producto')
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar estado del pedido (solo admin)
const updateEstadoPedido = async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = { 
  crearPedido, 
  getMisPedidos, 
  getAllPedidos, 
  updateEstadoPedido 
};