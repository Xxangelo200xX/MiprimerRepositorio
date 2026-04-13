import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-categorias-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './categorias-admin.html',
  styleUrls: ['./categorias-admin.css']
})
export class CategoriasAdminComponent implements OnInit {
  categorias: any[] = [];
  nuevaCategoria = '';
  editando: any = null;
  mensaje = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargarCategorias();
  }

  cargarCategorias() {
    this.http.get('http://localhost:3000/api/categorias').subscribe({
      next: (res: any) => {
        this.categorias = res;
      },
      error: (err) => console.error(err)
    });
  }

  crearCategoria() {
    if (!this.nuevaCategoria.trim()) return;
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.post('http://localhost:3000/api/categorias', { nombre: this.nuevaCategoria }, { headers }).subscribe({
      next: () => {
        this.mensaje = '✅ Categoría creada';
        this.nuevaCategoria = '';
        this.cargarCategorias();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.mensaje = '❌ ' + (err.error?.mensaje || 'Error al crear');
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  }

  iniciarEdicion(categoria: any) {
    this.editando = { ...categoria };
  }

  guardarEdicion() {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.put(`http://localhost:3000/api/categorias/${this.editando._id}`, { nombre: this.editando.nombre }, { headers }).subscribe({
      next: () => {
        this.mensaje = '✅ Categoría actualizada';
        this.editando = null;
        this.cargarCategorias();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.mensaje = '❌ Error al actualizar';
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  }

  eliminarCategoria(id: string, nombre: string) {
    if (!confirm(`¿Eliminar categoría "${nombre}"?`)) return;
    
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    this.http.delete(`http://localhost:3000/api/categorias/${id}`, { headers }).subscribe({
      next: () => {
        this.mensaje = `✅ Categoría "${nombre}" eliminada`;
        this.cargarCategorias();
        setTimeout(() => this.mensaje = '', 3000);
      },
      error: (err) => {
        this.mensaje = '❌ Error al eliminar';
        setTimeout(() => this.mensaje = '', 3000);
      }
    });
  }

  cancelarEdicion() {
    this.editando = null;
  }
}