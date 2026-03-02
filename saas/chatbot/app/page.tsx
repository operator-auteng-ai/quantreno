import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Globe,
  LineChart,
  Search,
  Shield,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <Hero />
      <LogoBar />
      <HowItWorks />
      <Features />
      <ChatDemo />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link className="font-semibold text-lg tracking-tight" href="/">
          Quantreno
        </Link>
        <div className="flex items-center gap-6">
          <Link
            className="hidden text-muted-foreground text-sm transition-colors hover:text-foreground sm:block"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="hidden text-muted-foreground text-sm transition-colors hover:text-foreground sm:block"
            href="#pricing"
          >
            Pricing
          </Link>
          <Link
            className="inline-flex h-8 items-center rounded-md bg-brand px-4 font-medium text-brand-foreground text-sm transition-colors hover:bg-brand/90"
            href="/login"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--brand-muted),transparent_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 sm:pt-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-profit" />
            Now in beta — Kalshi markets live
          </div>

          <h1 className="font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl">
            Your AI quant for
            <br />
            <span className="text-brand">prediction markets</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Research catalysts, analyze mispricings, and execute trades on Kalshi
            — all through a single conversation. The trading SOP that runs
            itself.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-6 font-medium text-brand-foreground transition-colors hover:bg-brand/90"
              href="/register"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-6 font-medium text-sm transition-colors hover:bg-muted"
              href="#how-it-works"
            >
              See how it works
            </Link>
          </div>

          <p className="mt-4 text-muted-foreground text-xs">
            7-day free trial. No credit card required.
          </p>
        </div>

        {/* Terminal preview */}
        <div className="mx-auto mt-16 max-w-3xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-brand/5">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-signal-loss/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-signal-profit/60" />
              <span className="ml-2 text-muted-foreground text-xs">
                quantreno
              </span>
            </div>
            <div className="space-y-4 p-6 font-mono text-sm">
              <div className="text-muted-foreground">
                <span className="text-brand">you</span> &gt; Run the oil
                strategy
              </div>
              <div className="space-y-2 rounded-lg bg-muted/50 p-4 text-foreground">
                <div className="font-semibold text-brand">
                  TOP PICK: KXOIL-26MAR07-B72
                </div>
                <div className="mt-2 space-y-1 text-muted-foreground text-xs">
                  <div>
                    Market: WTI Crude above $72 by Friday &middot; Price: 38c YES
                  </div>
                  <div>Edge: +14 pts &middot; My est: 52% vs market 38%</div>
                  <div className="text-signal-profit">
                    Catalyst: OPEC+ emergency meeting Thursday, supply cut likely
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded bg-signal-profit/10 px-2 py-0.5 text-signal-profit text-xs">
                    High confidence
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                    BUY YES @ 38c
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                    $10 (26 contracts)
                  </span>
                </div>
              </div>
              <div className="text-muted-foreground">
                <span className="text-brand">you</span> &gt; Execute it
              </div>
              <div className="flex items-center gap-2 text-signal-profit">
                <Zap className="h-3.5 w-3.5" />
                Order filled: 26x YES @ 38c &middot; Cost: $9.88
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogoBar() {
  return (
    <section className="border-y border-border/50 bg-muted/30 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-center text-muted-foreground text-xs uppercase tracking-widest">
          Powered by
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-muted-foreground">
          <span className="font-medium text-sm">Kalshi</span>
          <span className="font-medium text-sm">Vercel AI SDK</span>
          <span className="font-medium text-sm">Claude &amp; GPT</span>
          <span className="font-medium text-sm">Tavily Search</span>
          <span className="font-medium text-sm">X API</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Connect your Kalshi account",
      description:
        "Link your Kalshi API credentials in seconds. Your keys are encrypted at rest and never stored in plaintext.",
      icon: Shield,
    },
    {
      number: "02",
      title: "Tell the agent what to research",
      description:
        'Say "run the oil strategy" or "find mispriced shutdown markets." The agent scans events, searches news and X, and triangulates sources.',
      icon: Search,
    },
    {
      number: "03",
      title: "Review and execute trades",
      description:
        "Get structured recommendations with edge calculations, catalyst timelines, and confidence levels. You confirm — it executes.",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="py-24" id="how-it-works">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Three steps to smarter trades
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            From market scan to order execution in a single conversation.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <div
              className="relative rounded-xl border border-border bg-card p-8"
              key={step.number}
            >
              <div className="mb-4 flex items-center gap-3">
                <span className="font-mono text-brand text-xs">
                  {step.number}
                </span>
                <step.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Bot,
      title: "AI trading agent",
      description:
        "Multi-model agent (Claude, GPT, Gemini) that applies your trading playbook with discipline you can't maintain manually.",
    },
    {
      icon: Globe,
      title: "Real-time research",
      description:
        "Web search + X/Twitter scanning to surface breaking catalysts before they're priced in. Three-layer source triangulation.",
    },
    {
      icon: BarChart3,
      title: "Strategy engine",
      description:
        "Pre-built strategies (oil, fat-tails, volatility swing, spread arb) or create your own in natural language.",
    },
    {
      icon: LineChart,
      title: "Portfolio tracking",
      description:
        "Persistent state across sessions. Every trade logged, every position tracked, P&L calculated in real-time.",
    },
    {
      icon: Zap,
      title: "Instant execution",
      description:
        "Place limit orders directly through chat with confirmation. No switching between tabs and tools.",
    },
    {
      icon: Shield,
      title: "Risk controls",
      description:
        "Kelly criterion sizing, position caps, mandatory thesis documentation. The agent won't YOLO — every trade is justified.",
    },
  ];

  return (
    <section className="border-t border-border/50 bg-muted/30 py-24" id="features">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Everything you need to trade prediction markets
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            The full SOP — market discovery, catalyst research, analysis,
            execution, and monitoring — in one chat interface.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              className="rounded-xl border border-border bg-card p-6"
              key={feature.title}
            >
              <feature.icon className="h-5 w-5 text-brand" />
              <h3 className="mt-4 font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ChatDemo() {
  const messages = [
    {
      role: "user" as const,
      content: "How are my positions doing?",
    },
    {
      role: "agent" as const,
      content: null,
      component: (
        <div className="space-y-3">
          <div className="font-semibold">Portfolio Summary</div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground text-xs">Balance</div>
              <div className="font-mono font-semibold">$847.32</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Open positions</div>
              <div className="font-mono font-semibold">4</div>
            </div>
            <div>
              <div className="text-muted-foreground text-xs">Unrealized P&amp;L</div>
              <div className="font-mono font-semibold text-signal-profit">
                +$23.40
              </div>
            </div>
          </div>
          <div className="mt-2 space-y-2 border-t border-border pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono">KXGOVSHUT-26MAR</span>
              <span className="text-signal-profit">+$8.20 (+41%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono">KXFED-26MAR19</span>
              <span className="text-signal-profit">+$12.50 (+31%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono">KXCPI-26MAR12</span>
              <span className="text-signal-loss">-$2.30 (-12%)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono">KXOIL-26MAR07</span>
              <span className="text-signal-profit">+$5.00 (+51%)</span>
            </div>
          </div>
          <div className="text-muted-foreground text-xs">
            Your government shutdown position has a catalyst tomorrow (House
            vote). Consider tightening your exit if the vote passes.
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Your portfolio, always in context
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            The agent remembers your positions, thesis, and track record across
            every session. No re-explaining.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl">
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="space-y-4 p-6">
              {messages.map((msg, i) => (
                <div
                  className={
                    msg.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                  key={i}
                >
                  <div
                    className={
                      msg.role === "user"
                        ? "max-w-sm rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-brand-foreground text-sm"
                        : "max-w-lg rounded-2xl rounded-bl-sm bg-muted px-4 py-3 text-sm"
                    }
                  >
                    {msg.content ?? msg.component}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Standard",
      price: "$100",
      period: "/mo",
      description: "For active traders who want AI-augmented research and execution.",
      features: [
        "Full AI trading agent",
        "Market discovery & catalyst research",
        "Custom strategy creation",
        "Trade execution & logging",
        "Portfolio tracking & P&L",
        "5 position checks/day",
        "Web + X/Twitter research",
      ],
      cta: "Start free trial",
      highlighted: false,
    },
    {
      name: "Premium",
      price: "$500",
      period: "/mo",
      description: "For serious traders who need continuous monitoring and scanning.",
      features: [
        "Everything in Standard",
        "Hourly position monitoring (24/7)",
        "Automated opportunity scanning",
        "Priority email alerts",
        "Strategy performance analytics",
        "Daily portfolio snapshots",
        "Priority support",
      ],
      cta: "Start free trial",
      highlighted: true,
    },
  ];

  return (
    <section
      className="border-t border-border/50 bg-muted/30 py-24"
      id="pricing"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            All AI costs included. No per-message charges. No usage surprises.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              className={`rounded-xl border p-8 ${
                tier.highlighted
                  ? "border-brand bg-card shadow-lg shadow-brand/10"
                  : "border-border bg-card"
              }`}
              key={tier.name}
            >
              {tier.highlighted && (
                <span className="mb-4 inline-block rounded-full bg-brand/10 px-3 py-1 font-medium text-brand text-xs">
                  Most popular
                </span>
              )}
              <h3 className="font-semibold text-xl">{tier.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-bold text-4xl tracking-tight">
                  {tier.price}
                </span>
                <span className="text-muted-foreground text-sm">
                  {tier.period}
                </span>
              </div>
              <p className="mt-3 text-muted-foreground text-sm">
                {tier.description}
              </p>
              <Link
                className={`mt-6 flex h-10 w-full items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                  tier.highlighted
                    ? "bg-brand text-brand-foreground hover:bg-brand/90"
                    : "border border-border hover:bg-muted"
                }`}
                href="/register"
              >
                {tier.cta}
              </Link>
              <ul className="mt-8 space-y-3">
                {tier.features.map((feature) => (
                  <li
                    className="flex items-start gap-3 text-sm"
                    key={feature}
                  >
                    <svg
                      className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M5 13l4 4L19 7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-muted-foreground text-xs">
          Both plans include a 7-day free trial. Cancel anytime.
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-bold text-3xl tracking-tight sm:text-4xl">
            Stop researching manually.
            <br />
            Start trading with an edge.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Your AI quant is ready. Connect your Kalshi account and run your
            first strategy in minutes.
          </p>
          <div className="mt-8">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-8 font-medium text-brand-foreground transition-colors hover:bg-brand/90"
              href="/register"
            >
              Start free trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <span className="font-semibold">Quantreno</span>
            <p className="mt-1 text-muted-foreground text-xs">
              AI-powered prediction market trading.
            </p>
          </div>
          <div className="flex gap-6 text-muted-foreground text-sm">
            <Link className="hover:text-foreground" href="/login">
              Sign In
            </Link>
            <Link className="hover:text-foreground" href="#pricing">
              Pricing
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-border/50 pt-8">
          <p className="text-center text-muted-foreground text-[11px] leading-relaxed">
            Quantreno is not a registered investment advisor, broker-dealer, or
            exchange. The information and tools provided do not constitute
            financial advice. Trading prediction markets involves risk of loss.
            Past performance does not guarantee future results. You are solely
            responsible for your trading decisions. By using this service, you
            acknowledge that you understand and accept these risks.
          </p>
        </div>
      </div>
    </footer>
  );
}
