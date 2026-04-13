import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';  // ← Agregar RouterModule aquí

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],  // ← Agregar RouterModule aquí
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  productos: any[] = [];
  carrito: any[] = [];
  usuario: any = null;
  esAdmin = false;
  mensaje = '';
  mostrarModal = false;
  productoModal = { _id: '', nombre: '', precio: 0, stock: 0, descripcion: '' };
  modalTitulo = '';
  modalAccion = '';

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('🟢 PRODUCTOS: Inicializando');
    this.cargarUsuario();
    this.cargarProductos();
    this.cargarCarrito();
  }

  cargarUsuario() {
    const userStr = localStorage.getItem('usuario');
    console.log('📦 Usuario desde storage:', userStr);
    
    if (userStr) {
      try {
        this.usuario = JSON.parse(userStr);
        this.esAdmin = this.usuario.rol === 'admin';
        console.log('👑 Rol:', this.usuario.rol);
        console.log('👑 Es admin?', this.esAdmin);
        this.cdr.detectChanges();
      } catch(e) {
        console.error('Error parsing usuario:', e);
      }
    } else {
      console.log('⚠️ No hay usuario en localStorage');
    }
  }

  cargarProductos() {
    console.log('🔄 Cargando productos...');
    this.http.get('http://localhost:3000/api/productos').subscribe({
      next: (res: any) => {
        console.log('✅ Productos recibidos:', res);
        this.productos = res;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar productos:', err);
        this.mensaje = '❌ Error al cargar productos';
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  }

  cargarCarrito() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost:3000/api/carrito', { headers }).subscribe({
      next: (res: any) => {
        this.carrito = res.productos || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error carrito:', err)
    });
  }

  agregarAlCarrito(productoId: string, nombre: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      this.mensaje = '❌ Debes iniciar sesión primero';
      setTimeout(() => this.mensaje = '', 3000);
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.post('http://localhost:3000/api/carrito/agregar', 
      { productoId, cantidad: 1 }, 
      { headers }
    ).subscribe({
      next: () => {
        this.mensaje = `✅ ${nombre} agregado al carrito`;
        setTimeout(() => this.mensaje = '', 3000);
        this.cargarCarrito();
        this.cdr.detectChanges();
      },
      error: () => {
        this.mensaje = '❌ Error al agregar al carrito';
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  }

  // ========== CRUD PRODUCTOS (SOLO ADMIN) ==========
  
 abrirCrearProducto() {
  if (!this.esAdmin) {
    this.mensaje = '❌ No tienes permisos de administrador';
    setTimeout(() => this.mensaje = '', 3000);
    return;
  }
  
  // Asegurar que _id está vacío
  this.productoModal = { 
    _id: '',  // Vacío para crear
    nombre: '', 
    precio: 0, 
    stock: 0, 
    descripcion: '' 
  };
  this.modalTitulo = 'Crear Producto';
  this.modalAccion = 'crear';
  this.mostrarModal = true;
  this.cdr.detectChanges();
}

  abrirEditarProducto(producto: any) {
    if (!this.esAdmin) {
      this.mensaje = '❌ No tienes permisos de administrador';
      setTimeout(() => this.mensaje = '', 3000);
      return;
    }
    
    this.productoModal = { 
      _id: producto._id, 
      nombre: producto.nombre, 
      precio: producto.precio, 
      stock: producto.stock, 
      descripcion: producto.descripcion || '' 
    };
    this.modalTitulo = 'Editar Producto';
    this.modalAccion = 'editar';
    this.mostrarModal = true;
    this.cdr.detectChanges();
  }

 guardarProducto() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    this.mensaje = '❌ No hay sesión. Inicia sesión nuevamente.';
    this.router.navigate(['/login']);
    return;
  }
  
  // Validaciones
  if (!this.productoModal.nombre || this.productoModal.nombre.trim() === '') {
    this.mensaje = '❌ El nombre del producto es obligatorio';
    setTimeout(() => this.mensaje = '', 3000);
    return;
  }
  
  if (this.productoModal.precio <= 0) {
    this.mensaje = '❌ El precio debe ser mayor a 0';
    setTimeout(() => this.mensaje = '', 3000);
    return;
  }
  
  if (this.productoModal.stock < 0) {
    this.mensaje = '❌ El stock no puede ser negativo';
    setTimeout(() => this.mensaje = '', 3000);
    return;
  }
  
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  
  // IMPORTANTE: No enviar _id al crear
  const productoParaEnviar = {
    nombre: this.productoModal.nombre,
    precio: this.productoModal.precio,
    stock: this.productoModal.stock,
    descripcion: this.productoModal.descripcion
  };
  
  console.log('📤 Enviando producto:', productoParaEnviar);

  if (this.modalAccion === 'crear') {
    this.http.post('http://localhost:3000/api/productos', productoParaEnviar, { headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Producto creado:', res);
        this.mensaje = '✅ Producto creado exitosamente';
        this.cargarProductos();
        this.cerrarModal();
        this.cdr.detectChanges();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error al crear:', err);
        
        if (err.status === 401) {
          this.mensaje = '❌ No autorizado. Inicia sesión nuevamente.';
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.mensaje = '❌ No tienes permisos de administrador';
        } else {
          this.mensaje = '❌ Error al crear producto: ' + (err.error?.mensaje || err.message);
        }
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  } else {
    // Para editar, sí enviamos el _id
    this.http.put(`http://localhost:3000/api/productos/${this.productoModal._id}`, this.productoModal, { headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Producto actualizado:', res);
        this.mensaje = '✅ Producto actualizado correctamente';
        this.cargarProductos();
        this.cerrarModal();
        this.cdr.detectChanges();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error al actualizar:', err);
        this.mensaje = '❌ Error al actualizar producto';
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  }
}

  eliminarProducto(id: string, nombre: string) {
    if (!this.esAdmin) {
      this.mensaje = '❌ No tienes permisos de administrador';
      setTimeout(() => this.mensaje = '', 3000);
      return;
    }
    
    if (!confirm(`¿Eliminar el producto "${nombre}"?`)) return;

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.delete(`http://localhost:3000/api/productos/${id}`, { headers }).subscribe({
      next: () => {
        console.log('✅ Producto eliminado');
        this.mensaje = `✅ ${nombre} eliminado correctamente`;
        this.cargarProductos();
        this.cdr.detectChanges();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        console.error('❌ Error al eliminar:', err);
        this.mensaje = '❌ Error al eliminar producto';
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.cdr.detectChanges();
  }

  // ========== NAVEGACIÓN ==========
  
  irAlCarrito() {
    this.router.navigate(['/cart']);
  }

  irAPedidos() {
    this.router.navigate(['/orders']);
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}