import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { CategoryFirestoreService } from '../../services/category-firestore/category-firestore';
import { Category } from '../../models/category';

@Component({
  selector: 'app-categories-firestore',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-firestore.html',
  styleUrl: './categories-firestore.css',
})
export class CategoriesFirestoreComponent {
  private categoryService = inject(CategoryFirestoreService);

  categories = toSignal(this.categoryService.listenCategories(), {
    initialValue: [] as Category[],
  });

  newCategoryName = signal('');
  editingCategory = signal<Category | null>(null);
  editingName = signal('');
  isLoading = signal(false);
  errorMessage = signal('');

  totalCategories = computed(() => this.categories().length);

  async addCategory(): Promise<void> {
    const name = this.newCategoryName().trim();
    if (!this.validateInput(name)) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.categoryService.createCategory({ name });
      this.newCategoryName.set('');
    } catch (error) {
      this.handleError('Error al crear categoría', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  startEdit(category: Category): void {
    this.editingCategory.set(category);
    this.editingName.set(category.name);
  }

  cancelEdit(): void {
    this.editingCategory.set(null);
    this.editingName.set('');
  }

  async updateCategory(): Promise<void> {
    const category = this.editingCategory();
    const name = this.editingName().trim();

    if (!category?.id || !this.validateInput(name)) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.categoryService.updateCategory(category.id, { name });
      this.cancelEdit();
    } catch (error) {
      this.handleError('Error al actualizar categoría', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteCategory(id?: string): Promise<void> {
    if (!id || !confirm('¿Estás seguro de eliminar esta categoría?')) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      await this.categoryService.deleteCategory(id);
    } catch (error) {
      this.handleError('Error al eliminar categoría', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private validateInput(name: string): boolean {
    if (name.trim().length < 3) {
      this.errorMessage.set('El nombre debe tener al menos 3 caracteres');
      return false;
    }
    return true;
  }

  private handleError(message: string, error: unknown): void {
    console.error(message, error);
    this.errorMessage.set(message);
  }
}
