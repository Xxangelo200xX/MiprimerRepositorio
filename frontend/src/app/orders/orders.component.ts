import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  pedidos: any[] = [];
  esAdmin = false;
  cargando = true;
  errorMensaje = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private cdr: ChangeDetectorRef  // ← Agregar esto
  ) {}

  ngOnInit() {
    console.log('🟢 ORDERS: Inicializando componente');
    this.verificarSesion();
    this.cargarUsuario();
    this.cargarPedidos();
  }

  verificarSesion() {
    let token = localStorage.getItem('token');
    let userStr = localStorage.getItem('usuario');
    
    if (!token) {
      token = sessionStorage.getItem('token');
      userStr = sessionStorage.getItem('usuario');
    }
    
    if (!token || !userStr) {
      this.errorMensaje = 'No hay sesión iniciada';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }
    
    if (token) {
      localStorage.setItem('token', token);
      sessionStorage.setItem('token', token);
    }
    if (userStr) {
      localStorage.setItem('usuario', userStr);
      sessionStorage.setItem('usuario', userStr);
    }
  }

  cargarUsuario() {
    let userStr = localStorage.getItem('usuario');
    if (!userStr) {
      userStr = sessionStorage.getItem('usuario');
    }
    
    if (userStr) {
      try {
        const usuario = JSON.parse(userStr);
        this.esAdmin = usuario.rol === 'admin';
        console.log('👑 Es admin:', this.esAdmin);
        this.cdr.detectChanges(); // ← Forzar detección
      } catch(e) {
        console.error('Error:', e);
      }
    }
  }

  cargarPedidos() {
    this.cargando = true;
    this.errorMensaje = '';
    this.cdr.detectChanges(); // ← Forzar detección
    
    let token = localStorage.getItem('token');
    if (!token) {
      token = sessionStorage.getItem('token');
    }
    
    if (!token) {
      this.errorMensaje = 'No hay token';
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    
    const url = this.esAdmin 
      ? 'http://localhost:3000/api/pedidos/todos' 
      : 'http://localhost:3000/api/pedidos/mis-pedidos';
    
    console.log(`🌐 Llamando a: ${url}`);
    
    this.http.get(url, { headers }).subscribe({
      next: (res: any) => {
        console.log('✅ Respuesta:', res);
        
        if (Array.isArray(res)) {
          this.pedidos = res;
        } else {
          this.pedidos = [];
        }
        
        console.log(`📊 Pedidos: ${this.pedidos.length}`);
        this.cargando = false;
        this.cdr.detectChanges(); // ← Forzar detección después de actualizar datos
      },
      error: (err) => {
        console.error('❌ Error:', err);
        this.errorMensaje = `Error: ${err.status}`;
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  recargarPedidos() {
    console.log('🔄 Recargando...');
    this.cargarPedidos();
  }

  actualizarEstado(pedidoId: string, nuevoEstado: string) {
    let token = localStorage.getItem('token');
    if (!token) token = sessionStorage.getItem('token');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.put(`http://localhost:3000/api/pedidos/${pedidoId}/estado`, 
      { estado: nuevoEstado }, 
      { headers }
    ).subscribe({
      next: () => {
        this.cargarPedidos();
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  getEstadoClass(estado: string): string {
    const clases: any = {
      'pendiente': 'badge bg-warning text-dark',
      'pagado': 'badge bg-info text-dark',
      'enviado': 'badge bg-primary',
      'entregado': 'badge bg-success',
      'cancelado': 'badge bg-danger'
    };
    return clases[estado] || 'badge bg-secondary';
  }

  seguirComprando() {
    this.router.navigate(['/products']);
  }

  cerrarSesion() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return 'Fecha no disponible';
    return new Date(fecha).toLocaleString('es-ES');
  }
}