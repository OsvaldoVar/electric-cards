// The portable single-file build always uses hash routing, including when served over HTTP.
export const usesHashRouting = import.meta.env.VITE_PORTABLE === true;
