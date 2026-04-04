"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useSettings } from "@/lib/providers/SettingsProvider";

export default function PrivacyPolicy() {
  const { getLogoUrl, getPlatformName } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="privacy-pattern"
              x="0"
              y="0"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"
                fill="white"
                fillOpacity="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#privacy-pattern)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            {/* <div className="relative h-10 w-10 md:h-12 md:w-12 hover:scale-110 transition-transform">
              <img
                src={getLogoUrl()}
                alt={`${getPlatformName()} Logo`}
                className="w-full h-full object-contain"
              />
            </div> */}
            <span className="text-2xl font-bold text-white">{getPlatformName()}</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-24 relative z-10">
        <Card className="max-w-4xl mx-auto shadow-2xl border-0">
          <CardHeader className="text-center border-b">
            <CardTitle className="text-3xl md:text-4xl">Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Last Updated: December 4, 2025
            </p>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <div className="space-y-6 text-sm md:text-base">
              {/* Introduction */}
              <section>
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="text-muted-foreground leading-relaxed">
                  At {getPlatformName()}, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully to understand our practices.
                </p>
              </section>

              {/* Information We Collect */}
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  We collect several types of information from and about users of our platform:
                </p>

                <h3 className="text-lg font-semibold mb-2 mt-4">2.1 Personal Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Full name, email address, phone number</li>
                  <li>Date of birth, gender, address</li>
                  <li>School/college name and academic level</li>
                  <li>For instructors: educational qualifications, CV, certificates</li>
                </ul>

                <h3 className="text-lg font-semibold mb-2 mt-4">2.2 Usage Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Course enrollment and completion data</li>
                  <li>Test scores and performance metrics</li>
                  <li>Video watch time and learning progress</li>
                  <li>Device information and IP addresses</li>
                  <li>Browser type and operating system</li>
                </ul>

                <h3 className="text-lg font-semibold mb-2 mt-4">2.3 Payment Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Transaction details and payment history</li>
                  <li>Billing information (processed securely through third-party payment processors)</li>
                </ul>
              </section>

              {/* How We Use Your Information */}
              <section>
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We use the collected information for various purposes:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>To provide and maintain our educational services</li>
                  <li>To process course enrollments and payments</li>
                  <li>To personalize your learning experience</li>
                  <li>To communicate with you about courses, updates, and promotions</li>
                  <li>To improve our platform and develop new features</li>
                  <li>To track and analyze usage patterns and performance</li>
                  <li>To prevent fraud and ensure platform security</li>
                  <li>To comply with legal obligations and enforce our terms</li>
                </ul>
              </section>

              {/* Information Sharing */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>With Instructors:</strong> Course enrollment and performance data with your enrolled instructors</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in platform operation (hosting, payment processing, analytics)</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sale of assets</li>
                  <li><strong>With Your Consent:</strong> When you explicitly authorize us to share your information</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              {/* Data Security */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We implement industry-standard security measures to protect your personal information, including encryption, secure servers, and access controls. However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </section>

              {/* Data Retention */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Course data and learning progress are retained as long as your account is active. After account deletion, we may retain certain information for legal and business purposes for up to 7 years.
                </p>
              </section>

              {/* Your Rights */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  You have the following rights regarding your personal information:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Data Portability:</strong> Receive your data in a structured format</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  To exercise these rights, please contact us at neplearns@gmail.com
                </p>
              </section>

              {/* Cookies */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  We use cookies and similar tracking technologies to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Remember your login and preferences</li>
                  <li>Analyze site traffic and user behavior</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Improve platform functionality and user experience</li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  You can control cookies through your browser settings, but disabling cookies may affect platform functionality.
                </p>
              </section>

              {/* Children's Privacy */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Children's Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {getPlatformName()} is intended for students aged 13 and above. For users under 18, we require parental or guardian consent. We do not knowingly collect personal information from children under 13 without verifiable parental consent. If we become aware of such collection, we will delete the information immediately.
                </p>
              </section>

              {/* Third-Party Links */}
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Third-Party Links</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies before providing any personal information.
                </p>
              </section>

              {/* International Users */}
              <section>
                <h2 className="text-xl font-semibold mb-3">11. International Data Transfers</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your information may be transferred to and processed in countries other than Nepal. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
                </p>
              </section>

              {/* Changes to Policy */}
              <section>
                <h2 className="text-xl font-semibold mb-3">12. Changes to This Privacy Policy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of {getPlatformName()} after changes are posted constitutes acceptance of the updated policy.
                </p>
              </section>

              {/* Contact Information */}
              <section className="pt-4 border-t">
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="mt-3 space-y-1 text-muted-foreground">
                  <p>📍 Kathmandu, Nepal</p>
                  <p>📧 neplearns@gmail.com</p>
                  <p>📞 +977 986-9906931</p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
