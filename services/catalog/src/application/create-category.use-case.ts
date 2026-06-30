import type { UseCase } from "@platform/application";
import type { IdGenerator } from "@platform/contracts";
import { UniqueEntityId } from "@platform/domain";
import type { TransactionalUnitOfWork } from "@platform/repository";
import { err, ok, type Result } from "@platform/types";
import type { DomainError } from "@platform/utils";
import { Category } from "../domain/category";
import type { CategoryRepository } from "../domain/category-repository";
import { Slug } from "../domain/value-objects/slug";

export interface CreateCategoryInput {
  readonly name: string;
  readonly slug: string;
}

export interface CreateCategoryOutput {
  readonly id: string;
}

export interface CreateCategoryDeps {
  readonly categories: CategoryRepository;
  readonly unitOfWork: TransactionalUnitOfWork<unknown>;
  readonly idGenerator: IdGenerator;
}

/** Creates a category. */
export class CreateCategory implements UseCase<
  CreateCategoryInput,
  CreateCategoryOutput,
  DomainError
> {
  private readonly deps: CreateCategoryDeps;

  constructor(deps: CreateCategoryDeps) {
    this.deps = deps;
  }

  async execute(input: CreateCategoryInput): Promise<Result<CreateCategoryOutput, DomainError>> {
    const slug = Slug.create(input.slug);
    if (!slug.ok) return err(slug.error);

    return this.deps.unitOfWork.run<Result<CreateCategoryOutput, DomainError>>(async () => {
      const id = UniqueEntityId.from(this.deps.idGenerator.generate());
      const category = Category.create(id, input.name, slug.value);
      await this.deps.categories.save(category);
      return ok({ id: id.toString() });
    });
  }
}
