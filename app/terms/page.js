"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useSettings } from "@/lib/providers/SettingsProvider";

export default function TermsAndConditions() {
  const { getLogoUrl, getPlatformName } = useSettings();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5a87] to-secondary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="terms-pattern"
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
          <rect width="100%" height="100%" fill="url(#terms-pattern)" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl" />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-10 w-10 md:h-12 md:w-12 hover:scale-110 transition-transform">
              <img
                src={getLogoUrl()}
                alt={`${getPlatformName()} Logo`}
                className="w-full h-full object-contain"
              />
            </div>
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
            <CardTitle className="text-3xl md:text-4xl">Terms and Conditions</CardTitle>
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
                  Welcome to {getPlatformName()}. These Terms and Conditions govern your use of our website and services. By accessing or using {getPlatformName()}, you agree to be bound by these terms. If you do not agree with any part of these terms, please do not use our platform.
                </p>
              </section>

              {/* Eligibility */}
              <section>
                <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  To use {getPlatformName()} services, you must:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Be at least 13 years old or have parental/guardian consent</li>
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be a resident of Nepal or have legal permission to access our services</li>
                </ul>
              </section>

              {/* User Accounts */}
              <section>
                <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  When you create an account with {getPlatformName()}:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>You are responsible for maintaining the confidentiality of your password</li>
                  <li>You agree to notify us immediately of any unauthorized use of your account</li>
                  <li>You may not share your account with others</li>
                  <li>We reserve the right to suspend or terminate accounts that violate our terms</li>
                </ul>
              </section>

              {/* Course Access and Payment */}
              <section>
                <h2 className="text-xl font-semibold mb-3">4. Course Access and Payment</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  Regarding courses and payments:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>All course prices are listed in Nepali Rupees (NPR)</li>
                  <li>Payment must be completed before accessing course materials</li>
                  <li>Course access is granted for the duration specified in the course description</li>
                  <li>Refunds are subject to our refund policy (within 7 days of purchase if no content accessed)</li>
                  <li>We reserve the right to modify course content and pricing at any time</li>
                </ul>
              </section>

              {/* Intellectual Property */}
              <section>
                <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All content on {getPlatformName()}, including videos, notes, practice tests, and study materials, is protected by copyright and intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from our content without explicit written permission. Content is for personal educational use only.
                </p>
              </section>

              {/* User Conduct */}
              <section>
                <h2 className="text-xl font-semibold mb-3">6. User Conduct</h2>
                <p className="text-muted-foreground leading-relaxed mb-2">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Share course materials or account access with non-enrolled users</li>
                  <li>Use the platform for any illegal or unauthorized purpose</li>
                  <li>Attempt to gain unauthorized access to our systems or other user accounts</li>
                  <li>Harass, abuse, or harm other users or instructors</li>
                  <li>Upload viruses or malicious code to our platform</li>
                  <li>Scrape or copy our content using automated tools</li>
                </ul>
              </section>

              {/* Instructor Terms */}
              <section>
                <h2 className="text-xl font-semibold mb-3">7. Instructor Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Instructors who create content for {getPlatformName()} agree to provide high-quality educational materials, maintain professional conduct, and comply with all applicable laws and regulations. {getPlatformName()} reserves the right to review and approve all course content before publication.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section>
                <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {getPlatformName()} provides educational services "as is" and makes no guarantees regarding exam results or academic performance. While we strive for accuracy, we are not responsible for any errors in course content. Our total liability shall not exceed the amount paid by you for the specific course in question.
                </p>
              </section>

              {/* Privacy */}
              <section>
                <h2 className="text-xl font-semibold mb-3">9. Privacy</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Your use of {getPlatformName()} is also governed by our Privacy Policy. Please review our{" "}
                  <Link href="/privacy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>{" "}
                  to understand how we collect, use, and protect your personal information.
                </p>
              </section>

              {/* Modifications */}
              <section>
                <h2 className="text-xl font-semibold mb-3">10. Modifications to Terms</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of {getPlatformName()} after changes are posted constitutes acceptance of the modified terms.
                </p>
              </section>

              {/* Termination */}
              <section>
                <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate your account and access to our services at any time, without prior notice, for conduct that we believe violates these Terms and Conditions or is harmful to other users, us, or third parties, or for any other reason.
                </p>
              </section>

              {/* Governing Law */}
              <section>
                <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms and Conditions are governed by and construed in accordance with the laws of Nepal. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Sahid Marg, Biratnagar, Morang, Nepal.
                </p>
              </section>

              {/* Contact Information */}
              <section className="pt-4 border-t">
                <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have any questions about these Terms and Conditions, please contact us:
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
