export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://medhaeclass.com";

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
