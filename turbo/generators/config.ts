import type { PlopTypes } from "@turbo/gen";

/** Workspace generators. Run with `pnpm gen`. */
export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("package", {
    description: "Scaffold a new @platform/* shared package",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "Package name without scope (e.g. http):",
      },
      {
        type: "input",
        name: "description",
        message: "One-line description:",
      },
    ],
    actions: [
      {
        type: "add",
        path: "packages/{{ kebabCase name }}/package.json",
        templateFile: "templates/package/package.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ kebabCase name }}/tsconfig.json",
        templateFile: "templates/package/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "packages/{{ kebabCase name }}/src/index.ts",
        templateFile: "templates/package/index.ts.hbs",
      },
    ],
  });
}
