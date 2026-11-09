/**
 * One product's official store badges, from its `stores` entry in data/products.js.
 * Used by the Products modal and by /apps, so both always carry the same links.
 * Renders only the badges; the caller supplies the row they sit in.
 */
import React from "react";
import { DIM } from "@/components/redesign/homePrimitives";

export default function StoreBadges({ product, testIdPrefix }) {
  const { name, stores } = product;

  return (
    <>
      {stores.googlePlay && (
        // Google's official badge, unaltered; its built-in transparent
        // margin is the clear space Google's badge rules ask for.
        <a
          href={stores.googlePlay}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
          data-testid={`${testIdPrefix}-google-play`}
        >
          <img
            src="/badges/google-play-badge.png"
            alt={`Get ${name} on Google Play`}
            width={646}
            height={250}
            style={{ height: 64, width: "auto" }}
          />
        </a>
      )}
      {stores.appStore ? (
        // Apple's official badge, unaltered. The SVG has no built-in
        // margin, so it is sized to the visible black box of the Google
        // badge (168 of its 250px, so 43px at the 64px above); the row
        // gap and Google's margin give it the clear space Apple asks for.
        <a
          href={stores.appStore}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
          data-testid={`${testIdPrefix}-app-store`}
        >
          <img
            src="/badges/app-store-badge.svg"
            alt={`Download ${name} on the App Store`}
            width={120}
            height={40}
            style={{ height: 43, width: "auto" }}
          />
        </a>
      ) : (
        stores.iosNote && (
          <span
            className="text-sm"
            style={{ color: DIM, fontFamily: "var(--font-mono)" }}
            data-testid={`${testIdPrefix}-ios-note`}
          >
            {stores.iosNote}
          </span>
        )
      )}
    </>
  );
}
