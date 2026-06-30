import type { Price } from "./price";

/** Persistence port for {@link Price}. Implemented in infrastructure. */
export interface PriceRepository {
  save(price: Price): Promise<void>;
  findById(id: string): Promise<Price | null>;
}
