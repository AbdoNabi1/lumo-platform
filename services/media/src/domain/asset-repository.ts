import type { Asset } from "./asset";

/** Persistence port for {@link Asset}. Implemented in infrastructure. */
export interface AssetRepository {
  save(asset: Asset): Promise<void>;
  findById(id: string): Promise<Asset | null>;
}
