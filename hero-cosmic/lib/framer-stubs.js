/**
 * Minimal stubs for Framer-only APIs.
 * The liquid_glass_carousel.js uses `addPropertyControls`, `ControlType`,
 * and `useIsStaticRenderer` — none of which exist in a standard Next.js app.
 * We stub them so the module loads without error.
 */

export const addPropertyControls = () => {};
export const ControlType = {
  Array: "array",
  Object: "object",
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Color: "color",
  Enum: "enum",
  Font: "font",
  ResponsiveImage: "responsiveImage",
};
// In Next.js we are never a static renderer — always return false.
export const useIsStaticRenderer = () => false;
