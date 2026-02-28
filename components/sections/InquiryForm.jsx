"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Send, Clock, Mail, Phone } from "lucide-react";
import { inquiryBenefits } from "@/lib/constants/data";
import { toast } from "sonner";
import inquiryService from "@/lib/services/inquiry.service";

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    level: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.level) {
      newErrors.level = "Please select your level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please check the form for errors");
      return;
    }

    setIsSubmitting(true);

    try {
      await inquiryService.submitInquiry({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim().replace(/\s/g, ""),
        level: formData.level,
        message: formData.message.trim(),
      });

      toast.success("Inquiry submitted successfully!");
      
      setFormData({
        name: "",
        email: "",
        phone: "",
        level: "",
        message: "",
      });
      setErrors({});
    } catch (error) {
      toast.error("Failed to submit inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <section id="contact" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 block">
              Get in Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-light text-slate-800 mb-4">
              Have Questions?
            </h2>
            <p className="text-slate-500">
              Our counselors are here to help you find the right learning path
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-8">
            {/* Left Column - Contact Info */}
            <div className="md:col-span-2 space-y-6">
              {/* Quick Response Card */}
              <Card className="border border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-slate-800">
                    Quick Response
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    We typically respond within 2 hours during business hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Mon-Fri: 9AM - 6PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>support@neplearn.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>+977 98XXXXXXXX</span>
                  </div>
                </CardContent>
              </Card>

              {/* Benefits List - Clean version */}
              <Card className="border border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg font-medium text-slate-800">
                    Why Reach Out?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {inquiryBenefits.slice(0, 4).map((benefit, index) => (
                      <li key={index} className="text-sm text-slate-600 flex items-start gap-2">
                        <span className="text-slate-300 mt-1">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Form */}
            <div className="md:col-span-3">
              <Card className="border border-slate-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-light text-slate-800">
                    Send Your Inquiry
                  </CardTitle>
                  <CardDescription className="text-slate-500">
                    Fill out the form and we'll get back to you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm text-slate-600">
                        Full Name <span className="text-slate-400">*</span>
                      </Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        disabled={isSubmitting}
                        className={cn(
                          "border-slate-200 focus:border-slate-300 focus:ring-0",
                          errors.name && "border-red-300"
                        )}
                      />
                      {errors.name && (
                        <p className="text-xs text-red-400">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-slate-600">
                        Email Address <span className="text-slate-400">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        disabled={isSubmitting}
                        className={cn(
                          "border-slate-200 focus:border-slate-300 focus:ring-0",
                          errors.email && "border-red-300"
                        )}
                      />
                      {errors.email && (
                        <p className="text-xs text-red-400">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm text-slate-600">
                        Phone Number <span className="text-slate-400">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="98XXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        disabled={isSubmitting}
                        className={cn(
                          "border-slate-200 focus:border-slate-300 focus:ring-0",
                          errors.phone && "border-red-300"
                        )}
                      />
                      {errors.phone && (
                        <p className="text-xs text-red-400">{errors.phone}</p>
                      )}
                    </div>

                    {/* Level */}
                    <div className="space-y-2">
                      <Label htmlFor="level" className="text-sm text-slate-600">
                        Current Level <span className="text-slate-400">*</span>
                      </Label>
                      <Select
                        value={formData.level}
                        onValueChange={(value) => handleChange("level", value)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          className={cn(
                            "border-slate-200 focus:border-slate-300 focus:ring-0",
                            errors.level && "border-red-300"
                          )}
                        >
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="see">SEE (Class 10)</SelectItem>
                          <SelectItem value="plus2-science">+2 Science</SelectItem>
                          <SelectItem value="plus2-management">+2 Management</SelectItem>
                          <SelectItem value="plus2-humanities">+2 Humanities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.level && (
                        <p className="text-xs text-red-400">{errors.level}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-sm text-slate-600">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your goals..."
                        rows={3}
                        value={formData.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        disabled={isSubmitting}
                        className="border-slate-200 focus:border-slate-300 focus:ring-0 resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-slate-400 text-center mt-4">
                      * Required fields
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}