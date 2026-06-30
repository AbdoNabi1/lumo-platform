import type {
  AdjustInventory,
  AdjustInventoryInput,
} from "../application/adjust-inventory.use-case";
import type {
  ReleaseReservation,
  ReleaseReservationInput,
} from "../application/release-reservation.use-case";
import type { ReserveStock, ReserveStockInput } from "../application/reserve-stock.use-case";
import type { ReceiveStock, ReceiveStockInput } from "../application/receive-stock.use-case";
import { type ControllerResponse, present } from "./presenter";

export interface InventoryControllerDeps {
  readonly receiveStock: ReceiveStock;
  readonly reserveStock: ReserveStock;
  readonly releaseReservation: ReleaseReservation;
  readonly adjustInventory: AdjustInventory;
}

/** Framework-agnostic interface boundary for inventory use-cases (no HTTP server). */
export class InventoryController {
  private readonly deps: InventoryControllerDeps;

  constructor(deps: InventoryControllerDeps) {
    this.deps = deps;
  }

  async receive(input: ReceiveStockInput): Promise<ControllerResponse> {
    return present(await this.deps.receiveStock.execute(input), 200);
  }

  async reserve(input: ReserveStockInput): Promise<ControllerResponse> {
    return present(await this.deps.reserveStock.execute(input), 201);
  }

  async release(input: ReleaseReservationInput): Promise<ControllerResponse> {
    return present(await this.deps.releaseReservation.execute(input), 200);
  }

  async adjust(input: AdjustInventoryInput): Promise<ControllerResponse> {
    return present(await this.deps.adjustInventory.execute(input), 200);
  }
}
