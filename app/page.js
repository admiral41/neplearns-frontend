import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSlider from "@/components/sections/HeroSlider";
import StatsBar from "@/components/sections/StatsBar";
import Courses from "@/components/sections/Courses";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import PrivateTutoring from "@/components/sections/PrivateTutoring";
import Testimonials from "@/components/sections/Testimonials";
import InquiryForm from "@/components/sections/InquiryForm";

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Neplearns",
  description:
    "Nepal's #1 online learning platform for SEE and +2 students with live classes, video lessons, and expert guidance.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://neplearns.com",
  sameAs: [
    "https://facebook.com/neplearns",
    "https://instagram.com/neplearns",
    "https://youtube.com/neplearns",
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Biratnagar",
    addressRegion: "Morang",
    addressCountry: "Nepal",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+977 986-9906931",
    contactType: "customer service",
    availableLanguage: ["English", "Nepali"],
  },
  offers: {
    "@type": "Offer",
    category: "Online Education",
    description: "SEE and +2 preparation courses with live classes",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="overflow-x-hidden">
        <Navbar />
        <main>
          <HeroSlider />
          <StatsBar />
          <Courses />
          <WhyChooseUs />
          <PrivateTutoring />
          <Testimonials />
          <InquiryForm />
        </main>
        <Footer />
      </div>
    </>
  );
}