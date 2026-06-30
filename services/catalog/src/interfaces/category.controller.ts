import type { CreateCategory, CreateCategoryInput } from "../application/create-category.use-case";
import { type ControllerResponse, present } from "./presenter";

/** Framework-agnostic interface boundary for category use-cases (no HTTP server). */
export class CategoryController {
  private readonly createCategory: CreateCategory;

  constructor(createCategory: CreateCategory) {
    this.createCategory = createCategory;
  }

  async create(input: CreateCategoryInput): Promise<ControllerResponse> {
    return present(await this.createCategory.execute(input), 201);
  }
}
