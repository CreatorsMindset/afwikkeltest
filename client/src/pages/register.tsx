import { PageShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export default function Register() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/participants", {
        firstName,
        lastName,
        email,
        optIn,
      });
      return res.json();
    },
    onSuccess: (data: { id: number }) => {
      navigate(`/test/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Er ging iets mis",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Voornaam is verplicht";
    if (!lastName.trim()) errs.lastName = "Achternaam is verplicht";
    if (!email.trim()) errs.email = "E-mailadres is verplicht";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Ongeldig e-mailadres";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      mutation.mutate();
    }
  }

  return (
    <PageShell>
      <section className="py-12 md:py-20 px-5">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl md:text-3xl font-medium mb-3">
              Even voorstellen
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Vul je gegevens in zodat we je resultaat kunnen bewaren.
              Na het invullen start de test direct.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  Voornaam
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jan"
                  className={errors.firstName ? "border-destructive" : ""}
                  data-testid="input-firstName"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Achternaam
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Janssen"
                  className={errors.lastName ? "border-destructive" : ""}
                  data-testid="input-lastName"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mailadres
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@voorbeeld.be"
                className={errors.email ? "border-destructive" : ""}
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="optIn"
                checked={optIn}
                onCheckedChange={(c) => setOptIn(c === true)}
                data-testid="checkbox-optIn"
              />
              <Label htmlFor="optIn" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                Ik ontvang graag af en toe inspiratie en updates over afwikkelen.
              </Label>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full text-base gap-2"
              disabled={mutation.isPending}
              data-testid="button-submit-registration"
            >
              {mutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Start de test
                  <ArrowRight size={18} />
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Je gegevens worden vertrouwelijk behandeld en enkel gebruikt
              voor het bezorgen van je resultaat.
            </p>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
