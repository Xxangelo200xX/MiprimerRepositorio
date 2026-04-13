const express = require('express');
const { getCarrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } = require('../controllers/carritoController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getCarrito);
router.post('/agregar', auth, agregarAlCarrito);
router.delete('/eliminar/:productoId', auth, eliminarDelCarrito);
router.delete('/vaciar', auth, vaciarCarrito);

module.exports = router;