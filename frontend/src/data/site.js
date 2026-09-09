/** Site-wide constants for conversion CTAs (issue #16). */
export const SUPPORT_EMAIL = "support@softogram.in";
export const PHONE_DISPLAY = "+91-6360158761";
export const PHONE_TEL = "tel:+91-6360158761";
export const WHATSAPP_HREF =
  "https://wa.me/916360158761?text=Hello%20Softogram!%20I%20have%20a%20project%20idea%20I'd%20like%20to%20discuss.";
/** Cal.com booking page (issue #48). Override with REACT_APP_BOOKING_URL if the slug changes. */
export const BOOKING_URL =
  process.env.REACT_APP_BOOKING_URL || "https://cal.com/softogram";

export const TRUST_BADGES = [
  {
    id: "clutch",
    label: "Clutch",
    href: process.env.REACT_APP_CLUTCH_URL || "https://clutch.co/profile/softogram",
  },
  {
    id: "goodfirms",
    label: "GoodFirms",
    href: process.env.REACT_APP_GOODFIRMS_URL || "https://www.goodfirms.co/company/softogram",
  },
  {
    id: "gbp",
    label: "Google Business",
    href:
      process.env.REACT_APP_GBP_URL ||
      "https://www.google.com/maps/search/?api=1&query=Softogram+Prayagraj",
  },
];

/**
 * Registered legal entity behind the Softogram brand.
 *
 * "Softogram" is a brand name, not a registered company. The company on every
 * legal document - bank, GST filings, app store developer accounts - is Opengram
 * Labs Private Limited. Anyone verifying us (an app store reviewer, a client's
 * finance team) sees that name on the paperwork and this site's name in the
 * browser, so the footer has to state the connection or the two look unrelated.
 *
 * CIN (Corporate Identity Number) is the 21-character id India's Ministry of
 * Corporate Affairs gives every registered company; it is public record and can
 * be looked up on the MCA site. GSTIN is the tax registration number, also
 * public. Nothing here is private: no PAN, no personal numbers.
 */
export const LEGAL_ENTITY = {
  name: "Opengram Labs Private Limited",
  address: "180/2E/18, Ganga Vihar, Dhoomanganj, Prayagraj, Uttar Pradesh 211011, India",
  cin: "U62011UP2026PTC251899",
  gstin: "09AAFCO3449M1ZX",
  email: "founder@softogram.in",
  phoneDisplay: "+91 6360158761",
  phoneTel: "tel:+916360158761",
  /** The line that explains the name mismatch before anyone has to ask. */
  brandNote: "Softogram is a brand of Opengram Labs Private Limited.",
};
