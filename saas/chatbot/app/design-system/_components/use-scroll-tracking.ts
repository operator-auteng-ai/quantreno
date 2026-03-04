"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { Section } from "./sections-config";

export function useScrollTracking(sections: readonly Section[]) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const isScrollingRef = useRef(false);

  // Scroll tracking — highlight sidebar item matching visible section
  useEffect(() => {
    const handleScroll = () => {
      if (isScrollingRef.current) return;
      const offset = 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i].id);
        if (el && el.getBoundingClientRect().top < offset) {
          setActiveSection(sections[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  // Deep-link support — scroll to hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) {
        // Small delay to let the page render before scrolling
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
          setActiveSection(hash);
        }, 100);
      }
    }
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    isScrollingRef.current = true;
    setActiveSection(id);
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 800);
  }, []);

  return { activeSection, scrollToSection };
}
