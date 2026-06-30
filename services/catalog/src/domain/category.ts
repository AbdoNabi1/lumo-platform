import { AggregateRoot, type UniqueEntityId } from "@platform/domain";
import type { Slug } from "./value-objects/slug";

interface CategoryProps {
  name: string;
  slug: Slug;
}

/** Catalog category aggregate (minimal — Phase 1 scope). */
export class Category extends AggregateRoot<CategoryProps> {
  static create(id: UniqueEntityId, name: string, slug: Slug): Category {
    return new Category({ name, slug }, id);
  }

  get name(): string {
    return this.props.name;
  }

  get slug(): Slug {
    return this.props.slug;
  }
}
