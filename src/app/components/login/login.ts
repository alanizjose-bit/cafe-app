import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { FirebaseService } from '../../services/firebase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './login.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  async onLogin() {
    if (this.loginForm.valid) {
      this.loading = true;
      try {
        const { email, password } = this.loginForm.value;
        await this.firebaseService.login(email, password);
        this.snackBar.open('¡Bienvenido!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.snackBar.open(error, 'Cerrar', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    }
  }

  async onRegister() {
    if (this.registerForm.valid) {
      const { password, confirmPassword } = this.registerForm.value;

      if (password !== confirmPassword) {
        this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', { duration: 3000 });
        return;
      }

      this.loading = true;
      try {
        const { email } = this.registerForm.value;
        await this.firebaseService.registrar(email, password);
        this.snackBar.open('¡Registro exitoso!', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard']);
      } catch (error: any) {
        this.snackBar.open(error, 'Cerrar', { duration: 3000 });
      } finally {
        this.loading = false;
      }
    }
  }
}
