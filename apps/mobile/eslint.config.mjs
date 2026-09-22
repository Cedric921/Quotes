// @ts-check
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

/**
 * Focus mobile — lint rules for the v2 design system.
 *
 * The one rule that matters: no colour literals outside `src/theme/`.
 * Without it the 224 hard-coded hex values we just removed grow straight back.
 *
 * The TypeScript parser is not optional here: with the default parser every
 * `.ts`/`.tsx` file fails on its first type annotation, and a config that
 * cannot parse a file cannot enforce anything in it — the rules below would
 * silently pass on all 156 of them.
 *
 * `react-hooks` is registered for the same reason the other two rules exist:
 * the v1 audit's re-render problem was a dependency-array problem as much as
 * a `StyleSheet` one, and an unregistered rule turns every
 * `eslint-disable-next-line react-hooks/...` into an error of its own.
 */

const COLOUR_LITERAL =
  /^(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(|hsla?\()/;

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/theme/**"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${COLOUR_LITERAL.source}/]`,
          message:
            "No colour literals outside src/theme/. Use a token via useTheme() or makeStyles().",
        },
        {
          // v1 shipped 14 files calling this inside a component body.
          selector:
            "FunctionDeclaration CallExpression[callee.object.name='StyleSheet'][callee.property.name='create']",
          message:
            "Wrap StyleSheet.create in makeStyles() so the sheet is built once per theme, not once per render.",
        },
      ],
    },
  },
];
