const express = require('express');
const { 
  getProductos, 
  getProductosByCategoria,
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto 
} = require('../controllers/productoController');
const auth = require('../middleware/auth');
const verificarRol = require('../middleware/role');

const router = express.Router();

// Rutas públicas
router.get('/', getProductos);
router.get('/categoria/:categoriaId', getProductosByCategoria);
router.get('/:id', getProductoById);

// Rutas protegidas (solo admin)
router.post('/', auth, verificarRol('admin'), createProducto);
router.put('/:id', auth, verificarRol('admin'), updateProducto);
router.delete('/:id', auth, verificarRol('admin'), deleteProducto);

module.exports = router;