import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  carrito: any = { productos: [] };
  total = 0;
  cargando = true;
  mensaje = '';

  constructor(private http: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.cargarCarrito();
  }

  cargarCarrito() {
    this.cargando = true;
    const token = localStorage.getItem('token');
    
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get('http://localhost:3000/api/carrito', { headers }).subscribe({
      next: (res: any) => {
        console.log('Carrito:', res);
        this.carrito = res;
        if (!this.carrito.productos) this.carrito.productos = [];
        this.calcularTotal();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  calcularTotal() {
    this.total = 0;
    if (this.carrito.productos && this.carrito.productos.length > 0) {
      this.total = this.carrito.productos.reduce((sum: number, item: any) => {
        return sum + ((item.producto?.precio || 0) * (item.cantidad || 0));
      }, 0);
    }
    this.cdr.detectChanges();
  }

  actualizarCantidad(productoId: string, nuevaCantidad: number) {
    if (nuevaCantidad < 1) {
      this.eliminarProducto(productoId);
      return;
    }

    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.delete(`http://localhost:3000/api/carrito/eliminar/${productoId}`, { headers }).subscribe({
      next: () => {
        this.http.post('http://localhost:3000/api/carrito/agregar', 
          { productoId, cantidad: nuevaCantidad }, 
          { headers }
        ).subscribe({
          next: () => {
            this.cargarCarrito();
            this.mensaje = '✅ Cantidad actualizada';
            setTimeout(() => this.mensaje = '', 2000);
          }
        });
      }
    });
  }

  eliminarProducto(productoId: string) {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.delete(`http://localhost:3000/api/carrito/eliminar/${productoId}`, { headers }).subscribe({
      next: () => {
        this.cargarCarrito();
        this.mensaje = '✅ Producto eliminado';
        setTimeout(() => this.mensaje = '', 2000);
      }
    });
  }

  vaciarCarrito() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.delete('http://localhost:3000/api/carrito/vaciar', { headers }).subscribe({
      next: () => {
        this.cargarCarrito();
        this.mensaje = '✅ Carrito vaciado';
        setTimeout(() => this.mensaje = '', 2000);
      }
    });
  }

  realizarPedido() {
    if (!this.carrito.productos || this.carrito.productos.length === 0) {
      this.mensaje = '❌ El carrito está vacío';
      setTimeout(() => this.mensaje = '', 2000);
      return;
    }

    this.cargando = true;
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.post('http://localhost:3000/api/pedidos', {}, { headers }).subscribe({
      next: () => {
        this.mensaje = '✅ Pedido realizado con éxito!';
        this.cargando = false;
        this.cargarCarrito();
        setTimeout(() => {
          this.router.navigate(['/orders']);
        }, 1500);
      },
      error: () => {
        this.mensaje = '❌ Error al realizar pedido';
        this.cargando = false;
      }
    });
  }

  seguirComprando() {
    this.router.navigate(['/products']);
  }
}