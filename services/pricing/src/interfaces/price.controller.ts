import type { ChangePrice, ChangePriceInput } from "../application/change-price.use-case";
import type { CreatePrice, CreatePriceInput } from "../application/create-price.use-case";
import { type ControllerResponse, present } from "./presenter";

export interface PriceControllerDeps {
  readonly createPrice: CreatePrice;
  readonly changePrice: ChangePrice;
}

/** Framework-agnostic interface boundary for price use-cases (no HTTP server). */
export class PriceController {
  private readonly deps: PriceControllerDeps;

  constructor(deps: PriceControllerDeps) {
    this.deps = deps;
  }

  async create(input: CreatePriceInput): Promise<ControllerResponse> {
    return present(await this.deps.createPrice.execute(input), 201);
  }

  async change(input: ChangePriceInput): Promise<ControllerResponse> {
    return present(await this.deps.changePrice.execute(input), 200);
  }
}
