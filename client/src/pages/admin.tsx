import { PageShell } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { profiles, type ProfileKey } from "@/lib/testData";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BarChart3, Mail, MailX, CheckCircle2 } from "lucide-react";

interface ParticipantRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  optIn: boolean;
  createdAt: string;
}

interface ResultRow {
  id: number;
  participantId: number;
  primaryProfile: string;
  secondaryProfile: string | null;
  scores: string;
  emailSent: boolean;
  createdAt: string;
}

export default function Admin() {
  const {
    data: participantList,
    isLoading: loadingP,
  } = useQuery<ParticipantRow[]>({
    queryKey: ["/api/admin/participants"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/participants");
      return res.json();
    },
  });

  const {
    data: resultList,
    isLoading: loadingR,
  } = useQuery<ResultRow[]>({
    queryKey: ["/api/admin/results"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/results");
      return res.json();
    },
  });

  const isLoading = loadingP || loadingR;
  const participantMap = new Map(
    (participantList ?? []).map((p) => [p.id, p])
  );

  // Merge results with participant data for the main table
  const enrichedResults = (resultList ?? []).map((r) => {
    const p = participantMap.get(r.participantId);
    return { ...r, participant: p };
  });

  const totalParticipants = participantList?.length ?? 0;
  const totalResults = resultList?.length ?? 0;
  const optInCount =
    participantList?.filter((p) => p.optIn).length ?? 0;

  return (
    <PageShell>
      <section className="py-8 md:py-12 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="font-serif text-xl md:text-2xl font-medium mb-1">
              Adminoverzicht
            </h1>
            <p className="text-sm text-muted-foreground">
              Deelnemers, resultaten en opt-in status.
            </p>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <KpiCard
              icon={<Users size={16} />}
              label="Deelnemers"
              value={isLoading ? "…" : String(totalParticipants)}
            />
            <KpiCard
              icon={<BarChart3 size={16} />}
              label="Resultaten"
              value={isLoading ? "…" : String(totalResults)}
            />
            <KpiCard
              icon={<Mail size={16} />}
              label="Opt-in"
              value={isLoading ? "…" : String(optInCount)}
            />
            <KpiCard
              icon={<CheckCircle2 size={16} />}
              label="E-mails verzonden"
              value={
                isLoading
                  ? "…"
                  : String(
                      resultList?.filter((r) => r.emailSent).length ?? 0
                    )
              }
            />
          </div>

          {/* Results table */}
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden mb-8">
            <div className="px-5 py-4 border-b border-border/50">
              <h2 className="font-semibold text-sm">
                Resultaten per deelnemer
              </h2>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : enrichedResults.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Nog geen resultaten.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="admin-results-table">
                  <thead>
                    <tr className="border-b border-border/50 bg-muted/30">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                        Naam
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                        E-mail
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                        Profiel
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                        Opt-in
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                        E-mail
                      </th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                        Datum
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrichedResults.map((r, idx) => {
                      const profileName =
                        profiles[r.primaryProfile as ProfileKey]?.name ??
                        r.primaryProfile;
                      const secondaryName = r.secondaryProfile
                        ? profiles[r.secondaryProfile as ProfileKey]?.name ??
                          r.secondaryProfile
                        : null;
                      const p = r.participant;
                      return (
                        <tr
                          key={r.id}
                          className="border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors"
                          data-testid={`admin-row-${r.id}`}
                        >
                          <td className="px-4 py-3 text-muted-foreground">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-medium">
                            {p
                              ? `${p.firstName} ${p.lastName}`
                              : `Deelnemer #${r.participantId}`}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {p?.email ?? "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-primary">
                              {profileName}
                            </span>
                            {secondaryName && (
                              <span className="text-muted-foreground text-xs ml-1.5">
                                + {secondaryName}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {p?.optIn ? (
                              <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                                <CheckCircle2 size={12} /> Ja
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                Nee
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {r.emailSent ? (
                              <Mail size={14} className="text-primary" />
                            ) : (
                              <MailX
                                size={14}
                                className="text-muted-foreground"
                              />
                            )}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                            {formatDate(r.createdAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Participants without results */}
          {!isLoading && participantList && (
            (() => {
              const resultParticipantIds = new Set(
                (resultList ?? []).map((r) => r.participantId)
              );
              const noResult = participantList.filter(
                (p) => !resultParticipantIds.has(p.id)
              );
              if (noResult.length === 0) return null;
              return (
                <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/50">
                    <h2 className="font-semibold text-sm">
                      Ingeschreven zonder resultaat ({noResult.length})
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/30">
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                            Naam
                          </th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                            E-mail
                          </th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                            Opt-in
                          </th>
                          <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">
                            Ingeschreven
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {noResult.map((p) => (
                          <tr
                            key={p.id}
                            className="border-b border-border/30 last:border-0"
                          >
                            <td className="px-4 py-3 font-medium">
                              {p.firstName} {p.lastName}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {p.email}
                            </td>
                            <td className="px-4 py-3">
                              {p.optIn ? (
                                <span className="text-xs text-primary font-medium">
                                  Ja
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  Nee
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-muted-foreground text-xs">
                              {formatDate(p.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </section>
    </PageShell>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("nl-BE", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
