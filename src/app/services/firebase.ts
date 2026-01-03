import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  user
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: string;
  nombre: string;
  email: string;
  createdAt?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore
  ) {
    this.user$ = user(this.auth);
  }

  // ============ AUTENTICACIÓN ============

  async registrar(email: string, password: string) {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async login(email: string, password: string) {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error: any) {
      throw this.handleAuthError(error);
    }
  }

  async logout() {
    try {
      await signOut(this.auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // ============ FIRESTORE - CRUD ============

  // Crear documento
  async agregarUsuario(usuario: Usuario) {
    try {
      const usuariosRef = collection(this.firestore, 'usuarios');
      const docRef = await addDoc(usuariosRef, {
        ...usuario,
        createdAt: new Date()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error al agregar usuario:', error);
      throw error;
    }
  }

  // Leer documentos (con Observable para real-time)
  obtenerUsuarios(): Observable<Usuario[]> {
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, orderBy('createdAt', 'desc'));
    return collectionData(q, { idField: 'id' }) as Observable<Usuario[]>;
  }

  // Actualizar documento
  async actualizarUsuario(id: string, data: Partial<Usuario>) {
    try {
      const docRef = doc(this.firestore, `usuarios/${id}`);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  // Eliminar documento
  async eliminarUsuario(id: string) {
    try {
      const docRef = doc(this.firestore, `usuarios/${id}`);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }

  // ============ MANEJO DE ERRORES ============

  private handleAuthError(error: any): string {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'El email ya está en uso';
      case 'auth/invalid-email':
        return 'Email inválido';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/invalid-credential':
        return 'Credenciales inválidas';
      default:
        return 'Error en la autenticación';
    }
  }
}
