const express = require('express');
const { crearPedido, getMisPedidos, getAllPedidos, updateEstadoPedido } = require('../controllers/pedidoController');
const auth = require('../middleware/auth');
const verificarRol = require('../middleware/role');

const router = express.Router();

router.post('/', auth, crearPedido);
router.get('/mis-pedidos', auth, getMisPedidos);
router.get('/todos', auth, verificarRol('admin'), getAllPedidos);
router.put('/:id/estado', auth, verificarRol('admin'), updateEstadoPedido);

module.exports = router;