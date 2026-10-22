import { MAX_FIX_ROUNDS, isBuildRunning } from "@/lib/build-fix";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Badge } from "@/components/ui";

type Build = { buildStatus: string | null; buildRounds: number; buildRunUrl: string | null };

/**
 * How the CI build of what AI committed is doing. The page refreshes itself while the build runs
 * (pass refresh={false} where the page already does that for several builds at once).
 */
export function BuildStatus({ build, refresh = true }: { build: Build; refresh?: boolean }) {
  const badge = buildBadge(build);
  if (!badge) return null;
  const linked = build.buildRunUrl ? (
    <a href={build.buildRunUrl} target="_blank" rel="noreferrer" title="Open the build on GitHub">
      {badge}
    </a>
  ) : (
    badge
  );
  return (
    <>
      {linked}
      {refresh && isBuildRunning(build.buildStatus) && <AutoRefresh />}
    </>
  );
}

function buildBadge(build: Build) {
  switch (build.buildStatus) {
    case "BUILDING":
      return <Badge>Building…</Badge>;
    case "FIXING":
      return (
        <Badge tone="attention">
          AI is fixing the build ({build.buildRounds}/{MAX_FIX_ROUNDS})
        </Badge>
      );
    case "PASSED":
      return <Badge tone="success">Build passed</Badge>;
    case "FAILED":
      return <Badge tone="danger">Build failed</Badge>;
    default:
      return null;
  }
}
