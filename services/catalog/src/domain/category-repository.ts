import type { Category } from "./category";

/** Persistence port for {@link Category}. Implemented in infrastructure. */
export interface CategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | null>;
}
