"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa";
import { useSettings } from "@/lib/providers/SettingsProvider";

const socialIconMap = {
  Facebook: FaFacebook,
  Instagram: FaInstagram,
  Youtube: FaYoutube,
};

export default function Footer() {
  const {
    getContactEmail,
    getPhones,
    getAddress,
    settings
  } = useSettings();

  // Only show social links that exist in DB
  const dynamicSocialLinks = (() => {
    const socials = settings?.socialLinks;
    if (!socials) return [];

    const links = [];
    if (socials.facebook) links.push({ platform: "Facebook", icon: "Facebook", url: socials.facebook });
    if (socials.instagram) links.push({ platform: "Instagram", icon: "Instagram", url: socials.instagram });
    if (socials.youtube) links.push({ platform: "Youtube", icon: "Youtube", url: socials.youtube });
    return links;
  })();

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      <div className="container mx-auto px-4 py-10">
        {/* Main Footer - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Contact */}
          <div className="space-y-3">
            <Link href="/" className="text-lg font-medium text-slate-800">
              NepLearns
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              {settings?.description || "Quality education for SEE and +2 students in Nepal."}
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{getAddress() || "Kathmandu, Nepal"}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <a href={`mailto:${getContactEmail()}`} className="hover:text-slate-700">
                  {getContactEmail() || "info@neplearn.com"}
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{getPhones()[0] || "+977 98XXXXXXXX"}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-3">Quick Links</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/courses" className="text-xs text-slate-500 hover:text-slate-700">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs text-slate-500 hover:text-slate-700">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-xs text-slate-500 hover:text-slate-700">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-medium text-slate-800 mb-3">Support</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/faq" className="text-xs text-slate-500 hover:text-slate-700">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-700">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-700">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-slate-800 mb-3">Connect</h3>
            
            {/* Social Icons */}
            {dynamicSocialLinks.length > 0 && (
              <div className="flex gap-2">
                {dynamicSocialLinks.map((social) => {
                  const Icon = socialIconMap[social.icon];
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
                      aria-label={social.platform}
                    >
                      {Icon && <Icon className="h-3.5 w-3.5" />}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Copyright - Simple Line */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p className="text-slate-400">
            © {new Date().getFullYear()} NepLearns. All rights reserved.
          </p>
          <p className="text-slate-400">
            Developed by{" "}
            <a
              href="https://greenmantis-porfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700"
            >
              GreenMantis
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}