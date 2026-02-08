"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, BarChart3, Users } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      opacity: number;
    }> = [];

    const colors = ["#E07A5F", "#81B29A", "#F2CC8F"];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 3 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.3 + 0.1,
      });
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      ctx.globalAlpha = 0.05;
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach((p2) => {
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = p1.color;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Public+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');

        :root {
          --color-coral: #E07A5F;
          --color-sage: #81B29A;
          --color-butter: #F2CC8F;
          --color-navy: #1A2332;
          --color-sand: #F4F1DE;
        }

        body {
          font-family: 'Public Sans', system-ui, sans-serif;
        }

        .font-display {
          font-family: 'Fraunces', serif;
          font-optical-sizing: auto;
        }

        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-scaleIn {
          animation: scaleIn 0.6s ease-out forwards;
        }

        .animate-slideInRight {
          animation: slideInRight 0.7s ease-out forwards;
        }

        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
        .stagger-4 { animation-delay: 0.4s; opacity: 0; }
        .stagger-5 { animation-delay: 0.5s; opacity: 0; }
        .stagger-6 { animation-delay: 0.6s; opacity: 0; }
      `}</style>

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "linear-gradient(135deg, #F4F1DE 0%, #E8E5D7 100%)" }}
      />

      <div className="relative z-10 min-h-screen">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-20 pb-32 md:pt-32 md:pb-40">
          <div className="max-w-6xl mx-auto">
            {/* Main Headline */}
            <div className="text-center mb-16">
              <h1 className="font-display text-6xl md:text-8xl font-bold mb-6 animate-fadeInUp"
                  style={{ color: "var(--color-navy)", lineHeight: "1.1" }}>
                Votre empreinte
                <br />
                <span style={{ color: "var(--color-coral)" }}>fiscale</span> révélée
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-fadeInUp stagger-1">
                Découvrez <span className="font-semibold" style={{ color: "var(--color-coral)" }}>ce que vous payez</span> en impôts et cotisations,
                et <span className="font-semibold" style={{ color: "var(--color-sage)" }}>ce que vous recevez</span> en services publics.
                <br />
                Transparent, sourcé, non-partisan.
              </p>
            </div>

            {/* CTA Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-20">
              {/* Discovery Mode Card */}
              <Link href="/decouverte" className="group">
                <div className="relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-scaleIn stagger-2"
                     style={{
                       backgroundColor: "white",
                       borderColor: "var(--color-sage)",
                     }}>
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <Sparkles size={32} style={{ color: "var(--color-sage)" }} />
                  </div>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
                          style={{ backgroundColor: "var(--color-sage)", color: "white" }}>
                      Sans compte
                    </span>
                  </div>
                  <h2 className="font-display text-3xl font-bold mb-3" style={{ color: "var(--color-navy)" }}>
                    Mode Découverte
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Explorez avec des profils types : enseignant, médecin, cadre, retraité...
                    Aucune inscription requise.
                  </p>
                  <div className="flex items-center font-semibold group-hover:translate-x-2 transition-transform"
                       style={{ color: "var(--color-sage)" }}>
                    Découvrir <ArrowRight className="ml-2" size={20} />
                  </div>
                </div>
              </Link>

              {/* Quiz Card */}
              <Link href="/quiz" className="group">
                <div className="relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl animate-scaleIn stagger-3"
                     style={{
                       backgroundColor: "white",
                       borderColor: "var(--color-butter)",
                     }}>
                  <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                    <BarChart3 size={32} style={{ color: "var(--color-butter)" }} />
                  </div>
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
                          style={{ backgroundColor: "var(--color-butter)", color: "var(--color-navy)" }}>
                      Ludique
                    </span>
                  </div>
                  <h2 className="font-display text-3xl font-bold mb-3" style={{ color: "var(--color-navy)" }}>
                    Quiz Fiscal
                  </h2>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    Testez vos connaissances sur le système fiscal français.
                    Questions personnalisées et surprenantes.
                  </p>
                  <div className="flex items-center font-semibold group-hover:translate-x-2 transition-transform"
                       style={{ color: "var(--color-butter)" }}>
                    Tester mes connaissances <ArrowRight className="ml-2" size={20} />
                  </div>
                </div>
              </Link>
            </div>

            {/* Auth CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fadeInUp stagger-4">
              <Link href="/auth/register">
                <Button size="lg"
                        className="px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-1"
                        style={{
                          backgroundColor: "var(--color-coral)",
                          color: "white",
                        }}>
                  <Users className="mr-2" size={20} />
                  Créer mon compte personnel
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg"
                        variant="outline"
                        className="px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg border-2"
                        style={{
                          borderColor: "var(--color-navy)",
                          color: "var(--color-navy)",
                        }}>
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section className="py-20" style={{ backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-16 animate-fadeInUp stagger-5"
                  style={{ color: "var(--color-navy)" }}>
                Une vision complète de vos finances publiques
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Transparent */}
                <div className="p-8 rounded-2xl transition-all duration-300 hover:scale-105 animate-slideInRight stagger-5"
                     style={{ backgroundColor: "white" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                       style={{ backgroundColor: "var(--color-sage)", color: "white" }}>
                    <span className="font-display text-3xl">🔍</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy)" }}>
                    100% Transparent
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Chaque euro, chaque pourcentage est <strong>sourcé et traçable</strong> jusqu'aux
                    données officielles (INSEE, PLF, DEPP).
                  </p>
                </div>

                {/* Non-partisan */}
                <div className="p-8 rounded-2xl transition-all duration-300 hover:scale-105 animate-slideInRight stagger-6"
                     style={{ backgroundColor: "white" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                       style={{ backgroundColor: "var(--color-coral)", color: "white" }}>
                    <span className="font-display text-3xl">⚖️</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy)" }}>
                    Non-partisan
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Aucun jugement moral. Juste <strong>vos chiffres personnalisés</strong> et
                    une compréhension claire du système.
                  </p>
                </div>

                {/* Précis */}
                <div className="p-8 rounded-2xl transition-all duration-300 hover:scale-105 animate-slideInRight stagger-6"
                     style={{ backgroundColor: "white" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                       style={{ backgroundColor: "var(--color-butter)", color: "var(--color-navy)" }}>
                    <span className="font-display text-3xl">🎯</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--color-navy)" }}>
                    Score de confiance
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Comprenez la <strong>fiabilité de vos résultats</strong> avec un score
                    qui évolue selon vos données vérifiées.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="animate-fadeInUp stagger-5">
                  <div className="font-mono text-5xl md:text-6xl font-bold mb-2" style={{ color: "var(--color-coral)" }}>
                    14
                  </div>
                  <div className="text-gray-700 font-semibold text-lg">
                    Modules complets
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    De l'IR aux services publics
                  </div>
                </div>

                <div className="animate-fadeInUp stagger-6">
                  <div className="font-mono text-5xl md:text-6xl font-bold mb-2" style={{ color: "var(--color-sage)" }}>
                    100%
                  </div>
                  <div className="text-gray-700 font-semibold text-lg">
                    Sources officielles
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    Barèmes 2025-2026
                  </div>
                </div>

                <div className="animate-fadeInUp stagger-6">
                  <div className="font-mono text-5xl md:text-6xl font-bold mb-2" style={{ color: "var(--color-butter)" }}>
                    RGPD
                  </div>
                  <div className="text-gray-700 font-semibold text-lg">
                    Conformité totale
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    Vos données, vos droits
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="py-20" style={{ backgroundColor: "var(--color-navy)" }}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              Prêt à découvrir votre empreinte fiscale ?
            </h2>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Commencez sans compte avec le mode découverte, ou créez votre profil personnalisé en 2 minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/decouverte">
                <Button size="lg"
                        className="px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        style={{
                          backgroundColor: "var(--color-sage)",
                          color: "white",
                        }}>
                  Essayer sans compte
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg"
                        className="px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                        style={{
                          backgroundColor: "var(--color-coral)",
                          color: "white",
                        }}>
                  Créer mon compte
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
