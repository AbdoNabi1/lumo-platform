import type { CreateProduct, CreateProductInput } from "../application/create-product.use-case";
import type { PublishProduct, PublishProductInput } from "../application/publish-product.use-case";
import type { UpdateProduct, UpdateProductInput } from "../application/update-product.use-case";
import { type ControllerResponse, present } from "./presenter";

export interface ProductControllerDeps {
  readonly createProduct: CreateProduct;
  readonly publishProduct: PublishProduct;
  readonly updateProduct: UpdateProduct;
}

/** Framework-agnostic interface boundary for product use-cases (no HTTP server). */
export class ProductController {
  private readonly deps: ProductControllerDeps;

  constructor(deps: ProductControllerDeps) {
    this.deps = deps;
  }

  async create(input: CreateProductInput): Promise<ControllerResponse> {
    return present(await this.deps.createProduct.execute(input), 201);
  }

  async publish(input: PublishProductInput): Promise<ControllerResponse> {
    return present(await this.deps.publishProduct.execute(input), 200);
  }

  async update(input: UpdateProductInput): Promise<ControllerResponse> {
    return present(await this.deps.updateProduct.execute(input), 200);
  }
}
