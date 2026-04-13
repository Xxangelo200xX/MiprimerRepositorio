const Producto = require('../models/Producto');

// Obtener todos los productos (con categoría poblada)
const getProductos = async (req, res) => {
  try {
    const productos = await Producto.find().populate('categoria');
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener productos por categoría
const getProductosByCategoria = async (req, res) => {
  try {
    const productos = await Producto.find({ categoria: req.params.categoriaId }).populate('categoria');
    res.json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener un producto por ID
const getProductoById = async (req, res) => {
  try {
    const producto = await Producto.findById(req.params.id).populate('categoria');
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Crear producto (solo admin)
const createProducto = async (req, res) => {
  try {
    const producto = new Producto(req.body);
    await producto.save();
    res.status(201).json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar producto (solo admin)
const updateProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar producto (solo admin)
const deleteProducto = async (req, res) => {
  try {
    const producto = await Producto.findByIdAndDelete(req.params.id);
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = { 
  getProductos, 
  getProductosByCategoria,
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto 
};