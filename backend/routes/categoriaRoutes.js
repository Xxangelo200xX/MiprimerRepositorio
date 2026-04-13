const express = require('express');
const { getCategorias, createCategoria, updateCategoria, deleteCategoria } = require('../controllers/categoriaController');
const auth = require('../middleware/auth');
const verificarRol = require('../middleware/role');

const router = express.Router();

// Rutas públicas
router.get('/', getCategorias);

// Rutas protegidas (solo admin)
router.post('/', auth, verificarRol('admin'), createCategoria);
router.put('/:id', auth, verificarRol('admin'), updateCategoria);
router.delete('/:id', auth, verificarRol('admin'), deleteCategoria);

module.exports = router;