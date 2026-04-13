import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { first, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  mensajeError = '';
  cargando = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    // Validar campos vacíos INMEDIATAMENTE
    if (!this.email.trim()) {
      this.mensajeError = '❌ Ingresa tu correo electrónico';
      return;
    }
    
    if (!this.password.trim()) {
      this.mensajeError = '❌ Ingresa tu contraseña';
      return;
    }
    
    // Validar formato de email INMEDIATAMENTE
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      this.mensajeError = '❌ Formato de email inválido';
      return;
    }
    
    this.cargando = true;
    this.mensajeError = '';

    console.log('Enviando login:', this.email);

    // Timeout de 5 segundos para no esperar mucho
    this.http.post('http://localhost:3000/api/auth/login', {
      email: this.email,
      password: this.password
    }).pipe(
      timeout(5000),
      first()
    ).subscribe({
      next: (res: any) => {
        console.log('Login exitoso');
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error:', err);
        
        // Mostrar error INMEDIATAMENTE según el tipo de error
        if (err.name === 'TimeoutError') {
          this.mensajeError = '❌ El servidor no responde. Intenta más tarde.';
        } else if (err.status === 400 || err.status === 401) {
          if (err.error?.mensaje === 'Email o contraseña incorrectos') {
            this.mensajeError = '❌ Contraseña incorrecta';
          } else {
            this.mensajeError = '❌ ' + (err.error?.mensaje || 'Credenciales incorrectas');
          }
        } else if (err.status === 0) {
          this.mensajeError = '❌ No hay conexión con el servidor';
        } else {
          this.mensajeError = '❌ Error al iniciar sesión';
        }
        
        this.cargando = false;
        this.password = ''; // Limpiar solo contraseña
      }
    });
  }
}