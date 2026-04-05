import { PageShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { profiles, type ProfileKey } from "@/lib/testData";
import {
  Heart,
  AlertTriangle,
  Compass,
  Lightbulb,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ResultData {
  id: number;
  participantId: number;
  primaryProfile: ProfileKey;
  secondaryProfile: ProfileKey | null;
  scores: string;
  createdAt: string;
  participant: {
    firstName: string;
    lastName: string;
  };
}

export default function Results() {
  const params = useParams<{ resultId: string }>();
  const resultId = params.resultId || "0";

  const { data, isLoading, error } = useQuery<ResultData>({
    queryKey: ["/api/results", resultId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/results/${resultId}`);
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <PageShell>
        <section className="py-12 md:py-20 px-5">
          <div className="max-w-2xl mx-auto space-y-6">
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-96 mx-auto" />
            <Skeleton className="h-64 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
        </section>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell>
        <section className="py-20 px-5 text-center">
          <p className="text-muted-foreground">Resultaat niet gevonden.</p>
        </section>
      </PageShell>
    );
  }

  const scores: Record<ProfileKey, number> = JSON.parse(data.scores);
  const primary = profiles[data.primaryProfile];
  const secondary = data.secondaryProfile ? profiles[data.secondaryProfile] : null;

  // Calculate max for visual bar scaling
  const maxScore = Math.max(...Object.values(scores));

  return (
    <PageShell>
      <section className="py-10 md:py-16 px-5">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-sm font-medium tracking-widest uppercase text-primary mb-3">
              Jouw Afwikkelprofiel
            </p>
            <h1 className="font-serif text-2xl md:text-3xl font-medium mb-3" data-testid="text-profile-name">
              {data.participant.firstName}, jij bent
              <span className="text-primary block mt-1">{primary.name}</span>
            </h1>
            <p className="text-base text-muted-foreground italic" data-testid="text-tagline">
              &ldquo;{primary.tagline}&rdquo;
            </p>
          </div>

          {/* Profile card */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 mb-6">
            <p className="text-base text-foreground leading-relaxed mb-6" data-testid="text-description">
              {primary.description}
            </p>

            <div className="space-y-6">
              <ReportSection
                icon={<Heart size={18} />}
                title="Jouw herkenbare kracht"
                content={primary.strength}
                testId="text-strength"
              />
              <ReportSection
                icon={<AlertTriangle size={18} />}
                title="Jouw typische overdrijving"
                content={primary.shadow}
                testId="text-shadow"
              />
              <ReportSection
                icon={<Compass size={18} />}
                title="Hoe je jezelf vastwikkelt"
                content={primary.howYouGetTangled}
                testId="text-tangled"
              />
              <ReportSection
                icon={<Lightbulb size={18} />}
                title="Wat je mag afwikkelen"
                content={primary.whatYouCarry}
                testId="text-carry"
              />
            </div>
          </div>

          {/* First move */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Compass size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">
                  Jouw eerste afwikkelbeweging
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed" data-testid="text-first-move">
                  {primary.firstMove}
                </p>
              </div>
            </div>
          </div>

          {/* Week advice */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                <Calendar size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground mb-2">
                  Voor de komende 7 dagen
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed" data-testid="text-week-advice">
                  {primary.weekAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Score visualization */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 mb-6">
            <h3 className="font-semibold text-sm mb-5">Jouw profieloverzicht</h3>
            <div className="space-y-4">
              {Object.entries(scores)
                .sort(([, a], [, b]) => b - a)
                .map(([key, score]) => {
                  const profile = profiles[key as ProfileKey];
                  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
                  const isPrimary = key === data.primaryProfile;
                  const isSecondary = key === data.secondaryProfile;

                  return (
                    <div key={key} data-testid={`score-bar-${key}`}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span
                          className={`text-sm ${
                            isPrimary
                              ? "font-semibold text-foreground"
                              : isSecondary
                              ? "font-medium text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {profile.name}
                          {isPrimary && (
                            <span className="text-primary text-xs ml-2 font-normal">
                              Primair
                            </span>
                          )}
                          {isSecondary && (
                            <span className="text-muted-foreground text-xs ml-2 font-normal">
                              Secundair
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: isPrimary
                              ? "hsl(var(--primary))"
                              : isSecondary
                              ? "hsl(var(--primary) / 0.6)"
                              : "hsl(var(--muted-foreground) / 0.3)",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Secondary profile */}
          {secondary && (
            <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 mb-6">
              <h3 className="font-semibold text-sm mb-2">
                Je secundaire profiel: {secondary.name}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3" data-testid="text-secondary-desc">
                {secondary.tagline}. {secondary.description.split('.').slice(0, 2).join('.')}.
              </p>
              <p className="text-xs text-muted-foreground">
                Dit patroon speelt ook een rol in hoe jij jezelf ingewikkeld maakt,
                naast je primaire profiel.
              </p>
            </div>
          )}

          {/* Next step CTA */}
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full mb-4">
              <BookOpen size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Volgende stap</span>
            </div>
            <h2 className="font-serif text-xl font-medium mb-3">
              Wil je dieper gaan?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
              Het boek <strong>Afwikkelen</strong> neemt je mee in alle vijf de profielen
              en geeft je concrete handvatten om los te komen uit patronen
              die je niet meer dienen. Ook workshops en trajecten zijn beschikbaar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="lg" className="gap-2" asChild>
                <a
                  href="https://www.volopinbalans.be"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-volopinbalans"
                >
                  Ontdek meer op Volop in Balans
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ReportSection({
  icon,
  title,
  content,
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  testId: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed" data-testid={testId}>
          {content}
        </p>
      </div>
    </div>
  );
}
