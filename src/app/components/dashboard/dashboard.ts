import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { FirebaseService, Usuario } from '../../services/firebase';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    MatToolbarModule,
    MatListModule
  ],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  usuarioForm: FormGroup;
  usuarios$!: Observable<Usuario[]>;
  currentUser: any;

  constructor(
    private fb: FormBuilder,
    private firebaseService: FirebaseService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.usuarioForm = this.fb.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.currentUser = this.firebaseService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.usuarios$ = this.firebaseService.obtenerUsuarios();
  }

  async onSubmit() {
    if (this.usuarioForm.valid) {
      try {
        await this.firebaseService.agregarUsuario(this.usuarioForm.value);
        this.snackBar.open('Usuario agregado correctamente', 'Cerrar', { duration: 3000 });
        this.usuarioForm.reset();
      } catch (error) {
        this.snackBar.open('Error al agregar usuario', 'Cerrar', { duration: 3000 });
      }
    }
  }

  async eliminar(id: string | undefined) {
    if (!id) return;
    try {
      await this.firebaseService.eliminarUsuario(id);
      this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
    } catch (error) {
      this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
    }
  }

  async logout() {
    try {
      await this.firebaseService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
