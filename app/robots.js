export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neplearns.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin-dashboard/",
          "/student-dashboard/",
          "/instructor-dashboard/",
          "/api/",
          "/unauthorized",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
