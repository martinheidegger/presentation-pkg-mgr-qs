import { useState, useEffect, useCallback, useRef } from "react";

const categoryColors = {
  Registry: {
    tagBg: "bg-violet-50",
    tagText: "text-violet-700",
    tagBorder: "border-violet-200",
    accent: "#7c3aed",
    accentLight: "#f5f3ff",
    accentMid: "#ddd6fe",
  },
  Infrastructure: {
    tagBg: "bg-blue-50",
    tagText: "text-blue-700",
    tagBorder: "border-blue-200",
    accent: "#1d4ed8",
    accentLight: "#eff6ff",
    accentMid: "#bfdbfe",
  },
  Security: {
    tagBg: "bg-red-50",
    tagText: "text-red-700",
    tagBorder: "border-red-200",
    accent: "#b91c1c",
    accentLight: "#fff1f2",
    accentMid: "#fecdd3",
  },
  Platform: {
    tagBg: "bg-amber-50",
    tagText: "text-amber-700",
    tagBorder: "border-amber-200",
    accent: "#b45309",
    accentLight: "#fffbeb",
    accentMid: "#fde68a",
  },
  Execution: {
    tagBg: "bg-orange-50",
    tagText: "text-orange-700",
    tagBorder: "border-orange-200",
    accent: "#c2410c",
    accentLight: "#fff7ed",
    accentMid: "#fed7aa",
  },
  Mutability: {
    tagBg: "bg-teal-50",
    tagText: "text-teal-700",
    tagBorder: "border-teal-200",
    accent: "#0f766e",
    accentLight: "#f0fdfa",
    accentMid: "#99f6e4",
  },
  Versioning: {
    tagBg: "bg-cyan-50",
    tagText: "text-cyan-700",
    tagBorder: "border-cyan-200",
    accent: "#0e7490",
    accentLight: "#ecfeff",
    accentMid: "#a5f3fc",
  },
  Reproducibility: {
    tagBg: "bg-green-50",
    tagText: "text-green-700",
    tagBorder: "border-green-200",
    accent: "#15803d",
    accentLight: "#f0fdf4",
    accentMid: "#bbf7d0",
  },
  Economics: {
    tagBg: "bg-yellow-50",
    tagText: "text-yellow-700",
    tagBorder: "border-yellow-200",
    accent: "#a16207",
    accentLight: "#fefce8",
    accentMid: "#fef08a",
  },
} satisfies Record<
  string,
  {
    tagBg: string;
    tagText: string;
    tagBorder: string;
    accent: string;
    accentLight: string;
    accentMid: string;
  }
>;

const slides = [
  {
    type: "title",
    title: "Questions to Ask About",
    subtitle: "Package Managers",
    note: "A framework for evaluating dependency ecosystems",
  },
  {
    type: "content",
    index: 1,
    category: "Registry",
    question: "Single-registry?",
    detail: "Git or single registry?",
    body: "Does the package manager rely on a single authoritative registry, or can packages be sourced from Git repositories, private registries, or mirrors? Single-registry ecosystems are easier to audit; multi-source setups offer flexibility but expand the attack surface.",
  },
  {
    type: "content",
    index: 2,
    category: "Infrastructure",
    question: "Is the client provider different from the server provider?",
    detail: "e.g. pnpm client / npm registry",
    body: "The CLI tool and the registry hosting packages may be maintained by entirely different organizations. Understand who controls each layer — the toolchain, the package index, and the CDN — and how their trust and availability guarantees differ.",
  },
  {
    type: "content",
    index: 3,
    category: "Security",
    question: "What are the security and safety guidelines?",
    detail: "Of the dependency providers",
    body: "Does the registry enforce MFA for publishing? Are packages signed or checksummed? Is there a vulnerability disclosure process, a malware removal policy, and a namespace squatting policy? Know the ecosystem's baseline security posture before trusting it.",
  },
  {
    type: "content",
    index: 4,
    category: "Platform",
    question: "Is the package expected to be compiled for the platform?",
    detail: "Native binaries vs. interpreted code",
    body: "Some packages ship pre-compiled native binaries, others compile from source at install time, and some are pure interpreted code. Platform-compiled packages introduce build toolchain dependencies, reproducibility concerns, and OS/arch combinatorial complexity.",
  },
  {
    type: "content",
    index: 5,
    category: "Execution",
    question: "Can packages run scripts during installation?",
    detail: "install / postinstall lifecycle hooks",
    body: "Lifecycle scripts (preinstall, postinstall, etc.) execute arbitrary code with your user's privileges at install time. This is a significant security surface. Can scripts be disabled globally? Does the package manager sandbox or prompt before execution?",
  },
  {
    type: "content",
    index: 6,
    category: "Mutability",
    question: "Can you edit the package's source code?",
    detail: "Patching, vendoring, and workspace overrides",
    body: "Is it possible to apply patches to installed packages without forking them? Tools like patch-package, Cargo's [patch], or Go's replace directive vary widely. Understand the workflow for emergency hotfixes to upstream dependencies.",
  },
  {
    type: "content",
    index: 7,
    category: "Versioning",
    question: "Can different versions of the same package be installed more than once?",
    detail: "Per OS or per project",
    body: "Some ecosystems (npm, Cargo) allow duplicate versions in the same dependency graph to satisfy conflicting constraints. Others (Python pip) enforce a single global version. This affects diamond dependency resolution, binary size, and debugging complexity.",
  },
  {
    type: "content",
    index: 8,
    category: "Reproducibility",
    question: "Is version pinning possible?",
    detail: "package-lock / lockfiles / strong hashes",
    body: "Does the package manager generate a lockfile with content-addressed hashes (SHA-512, etc.) that guarantees byte-for-byte reproducibility across machines and time? Weak pinning (version ranges without hashes) is insufficient for production deployments.",
  },
  {
    type: "content",
    index: 9,
    category: "Economics",
    question: "What are the package costs and incentives?",
    detail: "Free-tier limits, commercial licensing, sustainability",
    body: "Is publishing free? Are there rate limits or storage quotas? Do package authors have financial incentives to maintain or abandon their work? Understand the economic model that sustains (or doesn't sustain) the packages you depend on.",
  },
  {
    type: "content",
    index: 10,
    category: "Economics",
    question: "Who pays for the downloads?",
    detail: "Bandwidth, CDN, and egress costs",
    body: "Large-scale downloads have real infrastructure costs. Does the registry absorb egress fees, or are they passed to package authors? During a CI storm or supply-chain attack investigation, who bears the bandwidth bill? This affects registry reliability and incentive alignment.",
  },
] as const satisfies Array<
  | {
      type: "title";
      title: string;
      subtitle: string;
      note: string;
    }
  | {
      type: "content";
      index: number;
      category: keyof typeof categoryColors;
      question: string;
      detail: string;
      body: string;
    }
>;

export default function App() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (idx: number, dir: "next" | "prev") => {
      if (animating) return;
      setDirection(dir);
      setAnimating(true);
      setTimeout(() => {
        setCurrent(idx);
        setAnimating(false);
      }, 200);
    },
    [animating],
  );

  const next = useCallback(() => {
    if (current < slides.length - 1) goTo(current + 1, "next");
  }, [current, goTo]);

  const prev = useCallback(() => {
    if (current > 0) goTo(current - 1, "prev");
  }, [current, goTo]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        prev();
      }
      if (e.key === "f" || e.key === "F") toggleFullscreen();
      if (e.key === "Escape" && isFullscreen) document.exitFullscreen();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev, toggleFullscreen, isFullscreen]);

  const slide = slides[current];
  const slideColor = categoryColors[slide.type === "content" ? slide.category : "Registry"];

  return (
    // Outer wrapper
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100vh",
        background: slideColor ? slideColor.accentLight : "#faf9f6",
        transition: "background 300ms ease",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2% 3.5% 0",
        }}
      >
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.7em",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#a8a49c",
            userSelect: "none",
          }}
        >
          pkg-mgr-eval
        </span>

        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i, i > current ? "next" : "prev")}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                height: "4px",
                width: i === current ? "20px" : "6px",
                borderRadius: "2px",
                background: i === current ? "#44403c" : "#c8c5be",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width 300ms ease, background 300ms ease",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "monospace",
              fontSize: "0.7em",
              color: "#a8a49c",
              userSelect: "none",
            }}
          >
            {String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
            style={{
              background: "none",
              border: "1px solid #d6d3cc",
              borderRadius: "5px",
              cursor: "pointer",
              padding: "3px 5px",
              color: "#78716c",
              display: "flex",
              alignItems: "center",
              lineHeight: 1,
            }}
          >
            {isFullscreen ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 3v3a2 2 0 0 1-2 2H3" />
                <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
                <path d="M3 16h3a2 2 0 0 1 2 2v3" />
                <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 7V3h4" />
                <path d="M21 7V3h-4" />
                <path d="M3 17v4h4" />
                <path d="M21 17v4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2% 0",
        }}
      >
        <div
          style={{
            width: slide.type === "title" ? "100%" : "50%",
            overflow: "visible",
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${direction === "next" ? "-20px" : "20px"})`
              : "translateX(0)",
            transition: "opacity 200ms ease, transform 200ms ease, width 300ms ease",
          }}
        >
          {slide.type === "title" ? (
            <TitleSlide slide={slide as (typeof slides)[0]} />
          ) : (
            <ContentSlide slide={slide as (typeof slides)[1]} />
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 3.5% 2%",
        }}
      >
        <button
          onClick={prev}
          disabled={current === 0}
          style={{
            background: "none",
            border: "none",
            cursor: current === 0 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: current === 0 ? "#d6d3cc" : "#78716c",
            fontSize: "0.72em",
            fontFamily: "monospace",
            transition: "color 200ms",
          }}
        >
          ← prev
        </button>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.65em",
            color: "#c8c5be",
            userSelect: "none",
          }}
        >
          ← → arrow keys &nbsp;·&nbsp; F fullscreen
        </span>
        <button
          onClick={next}
          disabled={current === slides.length - 1}
          style={{
            background: "none",
            border: "none",
            cursor: current === slides.length - 1 ? "default" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: current === slides.length - 1 ? "#d6d3cc" : "#78716c",
            fontSize: "0.72em",
            fontFamily: "monospace",
            transition: "color 200ms",
          }}
        >
          next →
        </button>
      </div>
    </div>
  );
}

function TitleSlide({ slide }: { slide: (typeof slides)[0] }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: "0",
        position: "relative",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.75em",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#a8a49c",
          marginBottom: "1.2em",
        }}
      >
        // checklist
      </div>
      {/* Title — 75vw-wide text, bleeds beyond the content box */}
      <div style={{ position: "relative", width: "75vw", maxWidth: "75vw" }}>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 7.5vw, 9vw)",
            fontWeight: 300,
            color: "#57534e",
            lineHeight: 1.05,
            margin: 0,
            whiteSpace: "nowrap",
          }}
        >
          {slide.title}
        </h1>
        <h1
          style={{
            fontSize: "clamp(2.5rem, 7.5vw, 9vw)",
            fontWeight: 800,
            color: "#1c1917",
            lineHeight: 1.05,
            margin: "0 0 0.5em",
            whiteSpace: "nowrap",
          }}
        >
          {slide.subtitle}
        </h1>
      </div>
      <div
        style={{
          width: "48px",
          height: "2px",
          background: "#a8a49c",
          margin: "0.4em 0 0.9em",
        }}
      />
      <p
        style={{
          color: "#78716c",
          fontSize: "1em",
          maxWidth: "400px",
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        {slide.note}
      </p>
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "0.68em",
          color: "#c8c5be",
          marginTop: "2em",
        }}
      >
        10 questions &nbsp;·&nbsp; press → to begin
      </div>
    </div>
  );
}

function ContentSlide({ slide }: { slide: (typeof slides)[1] }) {
  const colors = categoryColors[slide.category] ?? categoryColors["Registry"];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 0,
      }}
    >
      {/* Category + index row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "4%",
        }}
      >
        <span
          className={`${colors.tagBg} ${colors.tagText} ${colors.tagBorder}`}
          style={{
            fontFamily: "monospace",
            fontSize: "0.72em",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "6px",
            border: "1px solid",
            letterSpacing: "0.05em",
          }}
        >
          {slide.category}
        </span>
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "0.7em",
            color: colors.accent,
            opacity: 0.5,
          }}
        >
          {String(slide.index).padStart(2, "0")} / 10
        </span>
      </div>

      {/* Question */}
      <h2
        style={{
          fontSize: "3em",
          fontWeight: 700,
          color: "#1c1917",
          margin: "0 0 0.3em",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {slide.question}
      </h2>

      {/* Detail */}
      <p
        style={{
          fontFamily: "monospace",
          fontSize: "0.78em",
          color: colors.accent,
          margin: "0 0 1.4em",
          opacity: 0.7,
        }}
      >
        {slide.detail}
      </p>

      <div
        style={{
          width: "36px",
          height: "2px",
          background: colors.accentMid,
          marginBottom: "1.4em",
        }}
      />

      {/* Body */}
      <p
        style={{
          fontSize: "1.05em",
          color: "#44403c",
          lineHeight: 1.8,
          margin: 0,
          maxWidth: "68ch",
        }}
      >
        {slide.body}
      </p>
    </div>
  );
}
