import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  submit() {
    this.error = '';
    this.loading = true;

    if (this.form.invalid) {
      this.error = 'Completa todos los campos';
      this.loading = false;
      return;
    }

    const { email, password } = this.form.value;
    
    console.log('📤 Enviando:', { email });
    
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('✅ Login OK:', response);
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('❌ Login ERROR:', err);
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}