/**
 * Full-color Softogram mark (PNG) for footer / social contexts.
 * Ported from Redesign-Softogram-Website (Phase 0).
 */
import React from "react";
import logoSrc from "../../assets/softogram-logo.png";

export default function Logo({ size = 32, className = "" }) {
  return (
    <div className={`flex items-center ${className}`} data-testid="site-logo-full">
      <img
        src={logoSrc}
        alt="Softogram logo"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
    </div>
  );
}
