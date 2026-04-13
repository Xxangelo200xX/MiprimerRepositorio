const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  descripcion: { type: String },
  imagenUrl: { type: String },
  categoria: { type: mongoose.Schema.Types.ObjectId, ref: 'Categoria' }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);