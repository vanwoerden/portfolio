// Single place to extend gating later: add a path glob to `blockedPaths` to fully
// block a new page, or add an entry to `metricGateRules` to withhold or fake specific
// fields in a JSON response. No other code or netlify.toml changes are needed for either.

export interface FakeValue {
  number: number;
  string: string;
  /**
   * Optional fabricated sparkline series. When present, the client renders a
   * (fake) sparkline next to the value instead of hiding it — a visible tease
   * that never reflects the real trend.
   */
  series?: number[];
  /**
   * Optional trailing substring of `string` (e.g. "seconds") to leave
   * unblurred on the client, so only the leading number/prefix is illegible.
   * Omit to blur the entire value.
   */
  revealSuffix?: string;
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
   * absolute value. The real relative/description are always dropped so no real
   * figures leak; series is dropped unless the fake value supplies its own. The
   * item is flagged `blurred: true` so the client blurs the fake value visually.
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
      "revenue": {
        number: 85000,
        string: "$85k+",
        // Fabricated growth curve — a visible tease, never the real trend.
        series: [3, 7, 12, 18, 25, 33, 43, 52, 62, 72, 82, 91, 100],
      },
      "time-to-file": {
        number: 45,
        string: "< 45 seconds",
        revealSuffix: "seconds",
      },
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
