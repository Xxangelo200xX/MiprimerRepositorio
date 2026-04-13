import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  nombre = '';
  email = '';
  password = '';
  mensaje = '';
  cargando = false;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    this.cargando = true;
    this.mensaje = '';

    console.log('📝 Registrando:', { nombre: this.nombre, email: this.email });

    this.http.post('http://localhost:3000/api/auth/registrar', {
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      rol: 'usuario'
    }).subscribe({
      next: () => {
        this.mensaje = '✅ Registro exitoso! Redirigiendo al login...';
        this.cargando = false;
        
        // LIMPIAR FORMULARIO
        this.nombre = '';
        this.email = '';
        this.password = '';
        
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error:', err);
        
        let errorMsg = 'Error en el registro';
        if (err.error?.mensaje) {
          errorMsg = err.error.mensaje;
        } else if (err.status === 400) {
          errorMsg = 'El email ya está registrado';
        } else if (err.status === 500) {
          errorMsg = 'Error en el servidor. Intenta más tarde.';
        }
        
        this.mensaje = '❌ ' + errorMsg;
        this.cargando = false;
        
        // NO limpiar el formulario para que el usuario pueda corregir
      }
    });
  }
}