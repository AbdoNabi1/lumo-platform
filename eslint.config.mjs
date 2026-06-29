import base from "@platform/eslint-config/base";

/** Root ESLint flat config — governs packages/ and tooling/. Apps own their own config. */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/coverage/**",
      // FROZEN UI — never lint the approved prototype
      "apps/admin/prototype/**",
    ],
  },
  ...base,
];
