const Resena = require('../models/Resena');

// Obtener reseñas de un producto
const getResenasByProducto = async (req, res) => {
  try {
    const resenas = await Resena.find({ producto: req.params.productoId }).populate('usuario', 'nombre');
    res.json(resenas);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Crear reseña (usuario autenticado)
const createResena = async (req, res) => {
  try {
    const { comentario, puntuacion } = req.body;
    const resena = new Resena({
      producto: req.params.productoId,
      usuario: req.user.id,
      comentario,
      puntuacion
    });
    await resena.save();
    res.status(201).json(resena);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar reseña (solo admin o dueño)
const deleteResena = async (req, res) => {
  try {
    const resena = await Resena.findById(req.params.id);
    if (!resena) return res.status(404).json({ mensaje: 'Reseña no encontrada' });
    
    if (resena.usuario.toString() !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ mensaje: 'No tienes permisos' });
    }
    
    await resena.deleteOne();
    res.json({ mensaje: 'Reseña eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

module.exports = { getResenasByProducto, createResena, deleteResena };