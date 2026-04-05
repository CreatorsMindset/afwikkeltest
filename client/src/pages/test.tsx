import { PageShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useLocation, useParams } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { statements, calculateResults } from "@/lib/testData";
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const LABELS = [
  "Helemaal niet",
  "Een beetje",
  "Neutraal",
  "Herkenbaar",
  "Helemaal",
];

export default function Test() {
  const params = useParams<{ participantId: string }>();
  const participantId = parseInt(params.participantId || "0");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalStatements = statements.length;
  const currentStatement = statements[currentIndex];
  const progress = ((Object.keys(answers).length) / totalStatements) * 100;
  const allAnswered = Object.keys(answers).length === totalStatements;

  const submitMutation = useMutation({
    mutationFn: async () => {
      const result = calculateResults(answers);
      const res = await apiRequest("POST", "/api/results", {
        participantId,
        primaryProfile: result.primaryProfile,
        secondaryProfile: result.secondaryProfile || null,
        scores: JSON.stringify(result.scores),
        emailSent: false,
      });
      return res.json();
    },
    onSuccess: (data: { id: number }) => {
      navigate(`/resultaat/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Er ging iets mis",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  function selectAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [currentStatement.id]: value }));
    // Auto-advance after short delay
    if (currentIndex < totalStatements - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 300);
    }
  }

  function handleSubmit() {
    setIsSubmitting(true);
    submitMutation.mutate();
  }

  return (
    <PageShell>
      <section className="py-8 md:py-12 px-5">
        <div className="max-w-lg mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Vraag {currentIndex + 1} van {totalStatements}
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progress)}% ingevuld
              </span>
            </div>
            <Progress value={progress} className="h-1.5" data-testid="progress-bar" />
          </div>

          {/* Statement card */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 mb-6 min-h-[200px] flex flex-col justify-center">
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              Stelling {currentIndex + 1}
            </p>
            <p className="text-base md:text-lg font-medium text-foreground leading-relaxed" data-testid="text-statement">
              {currentStatement.text}
            </p>
          </div>

          {/* Answer scale */}
          <div className="space-y-2 mb-8">
            {LABELS.map((label, i) => {
              const value = i + 1;
              const isSelected = answers[currentStatement.id] === value;
              return (
                <button
                  key={value}
                  onClick={() => selectAnswer(value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left text-sm ${
                    isSelected
                      ? "bg-primary/10 border-primary text-foreground font-medium"
                      : "bg-card border-border/50 text-muted-foreground hover:border-primary/40 hover:bg-primary/5"
                  }`}
                  data-testid={`button-answer-${value}`}
                >
                  <span
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={16} />}
                    {!isSelected && <span className="text-xs text-muted-foreground">{value}</span>}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className="gap-1"
              data-testid="button-prev"
            >
              <ArrowLeft size={16} />
              Vorige
            </Button>

            <div className="flex-1" />

            {currentIndex < totalStatements - 1 ? (
              <Button
                onClick={() => setCurrentIndex((i) => i + 1)}
                disabled={!answers[currentStatement.id]}
                className="gap-1"
                data-testid="button-next"
              >
                Volgende
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!allAnswered || isSubmitting}
                className="gap-1"
                data-testid="button-submit-test"
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Bekijk mijn resultaat
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Quick nav dots */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-8">
            {statements.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-6 h-6 rounded-full text-[10px] font-medium transition-all ${
                  i === currentIndex
                    ? "bg-primary text-primary-foreground"
                    : answers[s.id]
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
                aria-label={`Ga naar stelling ${i + 1}`}
                data-testid={`dot-${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
