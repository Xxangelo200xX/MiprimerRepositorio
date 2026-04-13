const express = require('express');
const { getResenasByProducto, createResena, deleteResena } = require('../controllers/resenaController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/producto/:productoId', getResenasByProducto);
router.post('/producto/:productoId', auth, createResena);
router.delete('/:id', auth, deleteResena);

module.exports = router;