const siteContent = require("./site-content.json");

function normalizeUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

function normalizeAssetPath(value) {
  const normalized = normalizeUrl(value);

  if (!normalized || normalized === "/") {
    return "";
  }

  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

module.exports = function() {
  const absoluteUrl = normalizeUrl(
    process.env.SITE_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || "https://lockrose.com"
  );

  return {
    ...siteContent,
    name: "Lockrose",
    absoluteUrl,
    url: "[INSERT]",
    address1: "The Clock House",
    address2: "Western Court",
    townCity: "Bishops Sutton",
    countyState: "Alresford",
    country: "United Kingdom",
    postalCode: "SO24 0AA",
    postalZipCode: "SO24 0AA",
    assetPath: normalizeAssetPath(process.env.ASSET_PATH),
    siteID: "lockrose-com",
    socialImage: "/images/img-sharing.webp",
    email: "info@lockrose.com",
    copyrightOwner: "Lockrose Ltd.",
    authorName: "Lockrose",
    authorEmail: "info@lockrose.com",
    authortelephone: "",
  };
};
