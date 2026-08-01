// @ts-check
/**
 * Focus mobile — lint rules for the v2 design system.
 *
 * The one rule that matters: no colour literals outside `src/theme/`.
 * Without it the 224 hard-coded hex values we just removed grow straight back.
 */

const COLOUR_LITERAL =
  /^(#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(|hsla?\()/;

export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/theme/**"],
    rules: {
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
