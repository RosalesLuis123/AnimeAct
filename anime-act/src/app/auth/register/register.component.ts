import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  error = '';
  success = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  // Getters para acceso fácil en template
  get username() { return this.form.get('username')!; }
  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
  get confirmPassword() { return this.form.get('confirmPassword')!; }

  // Verificar si contraseñas coinciden
  get passwordsMatch(): boolean {
    return this.password.value === this.confirmPassword.value;
  }

  get passwordMismatch(): boolean {
    return this.confirmPassword.touched && !this.passwordsMatch;
  }

  submit() {
    this.error = '';
    this.success = '';
    this.loading = true;

    // Validar formulario
    if (this.form.invalid) {
      this.error = 'Completa todos los campos correctamente';
      this.form.markAllAsTouched();
      this.loading = false;
      return;
    }

    // Validar contraseñas coincidan
    if (!this.passwordsMatch) {
      this.error = 'Las contraseñas no coinciden';
      this.confirmPassword.markAsTouched();
      this.loading = false;
      return;
    }

    const { username, email, password } = this.form.value;
    
    console.log('📤 Enviando registro:', { username, email });

    this.authService.register(username, email, password).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        this.success = '¡Usuario registrado correctamente!';
        this.loading = false;
        
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('❌ Error en registro:', err);
        this.error = err.message || 'Error al registrar usuario';
        this.loading = false;
      }
    });
  }
}