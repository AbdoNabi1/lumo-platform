import type { Product } from "./product";

/** Persistence port for {@link Product}. Implemented in infrastructure. */
export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
}
