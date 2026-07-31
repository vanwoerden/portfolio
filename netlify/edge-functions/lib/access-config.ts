// Single place to extend gating later: add a path glob to `blockedPaths` to fully
// block a new page, or add an entry to `redactionRules` to withhold specific fields
// from a JSON response. No other code or netlify.toml changes are needed for either.

export interface RedactionRule {
  /** Exact request path to intercept, e.g. "/data/project-metrics.json" */
  file: string;
  /** Path to the array inside the JSON body, e.g. ["projects", "sales-tax-filing", "metrics"] */
  arrayPath: string[];
  /** Field used to identify array items, e.g. "id" */
  matchField: string;
  /** Values of matchField to strip when the visitor is unauthenticated */
  matchValues: string[];
}

export const blockedPaths: string[] = [
  "/on/sales-tax-filing/*",
];

export const redactionRules: RedactionRule[] = [
  {
    file: "/data/project-metrics.json",
    arrayPath: ["projects", "sales-tax-filing", "metrics"],
    matchField: "id",
    matchValues: ["revenue", "time-to-file"],
  },
];

export function matchesBlockedPath(pathname: string): boolean {
  return blockedPaths.some((pattern) => {
    if (pattern.endsWith("/*")) {
      const prefix = pattern.slice(0, -1); // trailing "/" kept
      return pathname === prefix.slice(0, -1) || pathname.startsWith(prefix);
    }
    return pathname === pattern;
  });
}

export function findRedactionRule(pathname: string): RedactionRule | undefined {
  return redactionRules.find((rule) => rule.file === pathname);
}
