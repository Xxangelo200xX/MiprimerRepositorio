const Categoria = require('../models/Categoria');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.find().sort({ nombre: 1 });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Crear categoría (solo admin)
const createCategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    const existe = await Categoria.findOne({ nombre });
    if (existe) {
      return res.status(400).json({ mensaje: 'La categoría ya existe' });
    }
    
    const categoria = new Categoria({ nombre });
    await categoria.save();
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar categoría (solo admin)
const updateCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndUpdate(
      req.params.id, 
      { nombre: req.body.nombre }, 
      { new: true }
    );
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json(categoria);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar categoría (solo admin)
const deleteCategoria = async (req, res) => {
  try {
    const categoria = await Categoria.findByIdAndDelete(req.params.id);
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = { getCategorias, createCategoria, updateCategoria, deleteCategoria };