// Single place to extend gating later: add a path glob to `blockedPaths` to fully
// block a new page, or add an entry to `metricGateRules` to withhold or fake specific
// fields in a JSON response. No other code or netlify.toml changes are needed for either.

export interface FakeValue {
  number: number;
  string: string;
}

export interface MetricGateRule {
  /** Exact request path to intercept, e.g. "/data/project-metrics.json" */
  file: string;
  /** Path to the array inside the JSON body, e.g. ["projects", "sales-tax-filing", "metrics"] */
  arrayPath: string[];
  /** Field used to identify array items, e.g. "id" */
  matchField: string;
  /** matchField values to strip entirely when the visitor is unauthenticated */
  remove?: string[];
  /**
   * matchField values to KEEP (label still shown) but replace with a fabricated
   * absolute value. The real relative/series/description are dropped so no real
   * figures leak, and the item is flagged `blurred: true` so the client blurs
   * the fake value visually.
   */
  blur?: Record<string, FakeValue>;
}

export const blockedPaths: string[] = [
  "/on/sales-tax-filing/*",
];

export const metricGateRules: MetricGateRule[] = [
  {
    file: "/data/project-metrics.json",
    arrayPath: ["projects", "sales-tax-filing", "metrics"],
    matchField: "id",
    blur: {
      "revenue": { number: 85000, string: "$85k+" },
      "time-to-file": { number: 45, string: "< 45 seconds" },
    },
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

export function findMetricGateRule(pathname: string): MetricGateRule | undefined {
  return metricGateRules.find((rule) => rule.file === pathname);
}
