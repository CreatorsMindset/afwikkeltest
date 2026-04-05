import { PageShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ArrowRight, Clock, Target, Shield, Sparkles } from "lucide-react";

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <PageShell>
      {/* Hero */}
      <section id="hero" className="py-16 md:py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm font-medium tracking-widest uppercase text-primary mb-4">
            Gratis online assessment
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground leading-tight mb-6">
            Ontdek hoe jij jezelf
            <br />
            <span className="text-primary">ingewikkeld maakt</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mb-8 leading-relaxed">
            De Afwikkeltest laat je in 5 minuten zien welk patroon jou het meest kenmerkt.
            Geen vaag advies — maar een eerlijk profiel met herkenbare inzichten
            en een eerste stap richting meer rust.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="text-base px-8 gap-2"
              onClick={() => navigate("/inschrijven")}
              data-testid="button-start-test"
            >
              Start de test
              <ArrowRight size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Gratis &middot; 25 stellingen &middot; Direct resultaat
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-5 border-t border-border/50">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-xl md:text-2xl font-medium text-center mb-12">
            Wat je kunt verwachten
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard
              icon={<Clock size={20} />}
              title="5 minuten, eerlijk resultaat"
              description="25 stellingen die raken. Geen vage vragen, maar herkenbare situaties uit je dagelijks leven."
            />
            <FeatureCard
              icon={<Target size={20} />}
              title="Jouw Afwikkelprofiel"
              description="Ontdek welke van de vijf Wikkelaars jou het meest kenmerkt — en hoe dat patroon je vastzet."
            />
            <FeatureCard
              icon={<Sparkles size={20} />}
              title="Persoonlijk rapport"
              description="Geen kille scores, maar een warm en eerlijk profiel met je kracht, je valkuil én een eerste stap."
            />
            <FeatureCard
              icon={<Shield size={20} />}
              title="Veilig en privé"
              description="Je gegevens worden vertrouwelijk behandeld. Je resultaat is alleen voor jou."
            />
          </div>
        </div>
      </section>

      {/* Profiles preview */}
      <section className="py-16 px-5 bg-accent/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-serif text-xl md:text-2xl font-medium mb-4">
            De vijf Wikkelaars
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
            Iedereen wikkelt zichzelf op een eigen manier in. De test brengt in kaart
            welk patroon bij jou het sterkst aanwezig is.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { name: "De Drager", emoji: "🏔️", desc: "Draagt meer dan nodig" },
              { name: "De Pleaser", emoji: "🪞", desc: "Vormt zich naar de ander" },
              { name: "De Controleur", emoji: "🧭", desc: "Houdt alles strak" },
              { name: "De Twijfelaar", emoji: "🌀", desc: "Wikt en weegt eindeloos" },
              { name: "De Versneller", emoji: "⚡", desc: "Rent vooruit" },
            ].map((p) => (
              <div
                key={p.name}
                className="bg-card rounded-xl p-4 border border-border/50 text-center"
              >
                <span className="text-2xl block mb-2">{p.emoji}</span>
                <p className="text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-5">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="font-serif text-xl md:text-2xl font-medium mb-4">
            Klaar om jezelf te ontdekken?
          </h2>
          <p className="text-muted-foreground mb-8">
            De eerste stap naar afwikkelen is zien wat je ingewikkeld maakt.
            Het kost je 5 minuten — en levert herkenning op die blijft hangen.
          </p>
          <Button
            size="lg"
            className="text-base px-8 gap-2"
            onClick={() => navigate("/inschrijven")}
            data-testid="button-start-test-bottom"
          >
            Start de gratis test
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </PageShell>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-5 rounded-xl bg-card border border-border/50">
      <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
