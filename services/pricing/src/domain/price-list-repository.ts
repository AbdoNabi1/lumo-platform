import type { PriceList } from "./price-list";

/** Persistence port for {@link PriceList}. Implemented in infrastructure. */
export interface PriceListRepository {
  save(priceList: PriceList): Promise<void>;
  findById(id: string): Promise<PriceList | null>;
}
