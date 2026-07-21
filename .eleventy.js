const markdownIt = require("markdown-it");
const features = require("./features.json");

// Filters
const dateFilter = require("./src/filters/date-filter.js");
const md = markdownIt({ html: true });
const isProduction = process.env.ELEVENTY_ENV === "production";

function stripHtml(value) {
  return String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateText(value, maxLength = 280) {
  const text = stripHtml(value);

  if (!text || text.length <= maxLength) {
    return text;
  }

  const shortened = text.slice(0, Math.max(0, maxLength - 1));
  const lastSpaceIndex = shortened.lastIndexOf(" ");
  const safeText = lastSpaceIndex > 0 ? shortened.slice(0, lastSpaceIndex) : shortened;

  return `${safeText.trim()}...`;
}

function getItemDateValue(item) {
  const itemDate = item && item.data && item.data.date ? item.data.date : item && item.date ? item.date : null;

  if (itemDate) {
    const date = new Date(itemDate);

    if (!Number.isNaN(date.getTime())) {
      return date.getTime();
    }
  }

  if (item && item.data && item.data.year) {
    return Date.UTC(Number(item.data.year), 11, 31);
  }

  return 0;
}

function getFeedSummary(item, maxLength = 280) {
  if (!item || !item.data) {
    return "";
  }

  const candidateFields = [
    item.data.summary,
    item.data.excerpt,
    item.data.description,
    item.data.metaDesc,
    item.data.lede,
    item.data.postSummary
  ];

  const preferredField = candidateFields.find((value) => String(value || "").trim());

  if (preferredField) {
    return truncateText(preferredField, maxLength);
  }

  return truncateText(item.templateContent || "", maxLength);
}

function minifyHtmlOutput(content, outputPath) {
  if (!isProduction || !outputPath || !outputPath.endsWith(".html")) {
    return content;
  }

  return content
    .replace(/<!--(?!\[if[\s\S]*?endif\]-->)[\s\S]*?-->/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function getSectorOrder(item) {
  return Number(item.data.order || 0);
}

function sortSectors(left, right) {
  const orderCompare = getSectorOrder(left) - getSectorOrder(right);
  if (orderCompare !== 0) {
    return orderCompare;
  }

  return (left.data.title || "").localeCompare(right.data.title || "");
}

module.exports = function(eleventyConfig) {
  // Filters
  eleventyConfig.addFilter("dateFilter", dateFilter);
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("feedSummary", (item, maxLength = 280) => {
    return getFeedSummary(item, maxLength);
  });
  eleventyConfig.addFilter("latestItems", (items, count = 25) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return [...items]
      .sort((left, right) => {
        const dateCompare = getItemDateValue(right) - getItemDateValue(left);

        if (dateCompare !== 0) {
          return dateCompare;
        }

        return (left.data.title || "").localeCompare(right.data.title || "");
      })
      .slice(0, count);
  });
  eleventyConfig.addFilter("markdown", (content) => {
    if (!content) {
      return "";
    }

    return md.render(content);
  });

  eleventyConfig.addTransform("optimizeHtml", (content, outputPath) => {
    return minifyHtmlOutput(content, outputPath);
  });

  eleventyConfig.addCollection("sectorsItems", (collection) => {
    return collection.getFilteredByGlob("./src/sectors/*.md").sort(sortSectors);
  });

  // Passthrough copy
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/dl");
  eleventyConfig.addPassthroughCopy("src/favicon-96x96.png");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/web-app-manifest-192x192.png");
  eleventyConfig.addPassthroughCopy("src/web-app-manifest-512x512.png");
  eleventyConfig.addPassthroughCopy({ "src/fonts": "fonts" });
  eleventyConfig.addPassthroughCopy("src/images");

  if (features.blog) {
    const blogPlugin = require("./feature-packs/blog/plugin.js");
    blogPlugin(eleventyConfig);
  }

  if (features.caseStudies) {
    const caseStudiesPlugin = require("./feature-packs/case-studies/plugin.js");
    caseStudiesPlugin(eleventyConfig);
  }

  if (features.changelog) {
    const changelogPlugin = require("./feature-packs/changelog/plugin.js");
    changelogPlugin(eleventyConfig);
  }

  if (features.faqs) {
    const faqsPlugin = require("./feature-packs/faqs/plugin.js");
    faqsPlugin(eleventyConfig);
  }

  if (features.navigationMenus) {
    const navigationMenusPlugin = require("./feature-packs/navigation-menus/plugin.js");
    navigationMenusPlugin(eleventyConfig);
  }

  if (features.portfolio) {
    const portfolioPlugin = require("./feature-packs/portfolio/plugin.js");
    portfolioPlugin(eleventyConfig);
  }

  if (features.services) {
    const servicesPlugin = require("./feature-packs/services/plugin.js");
    servicesPlugin(eleventyConfig);
  }

  if (features.testimonials) {
    const testimonialsPlugin = require("./feature-packs/testimonials/plugin.js");
    testimonialsPlugin(eleventyConfig);
  }

  if (features.team) {
    const teamPlugin = require("./feature-packs/team/plugin.js");
    teamPlugin(eleventyConfig);
  }

  // Use .eleventyignore, not .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Directory structure
  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist"
    }
  };
};
