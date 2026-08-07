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
