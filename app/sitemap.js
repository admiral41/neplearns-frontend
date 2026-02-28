export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://neplearns.com";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/student-registration`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/instructor-application`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // TODO: Fetch dynamic pages (courses) from API when available
  // const courses = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/course/public`).then(res => res.json());
  // const coursePages = courses.data?.map((course) => ({
  //   url: `${baseUrl}/courses/${course.slug}`,
  //   lastModified: new Date(course.updatedAt),
  //   changeFrequency: "weekly",
  //   priority: 0.9,
  // })) || [];

  return [...staticPages];
}
