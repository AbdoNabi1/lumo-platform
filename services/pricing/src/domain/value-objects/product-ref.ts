import { Guard, type ValidationError, ValueObject } from "@platform/domain";
import { err, ok, type Result } from "@platform/types";

interface ProductRefProps {
  readonly value: string;
}

/**
 * A reference to a Catalog product/variant by **bare id** — no cross-context import or FK. This is
 * what a price points at; the product is owned by the Catalog context.
 */
export class ProductRef extends ValueObject<ProductRefProps> {
  static create(value: string): Result<ProductRef, ValidationError> {
    const guarded = Guard.againstEmpty(value, "productId");
    return guarded.ok ? ok(new ProductRef({ value })) : err(guarded.error);
  }

  get value(): string {
    return this.props.value;
  }
}
