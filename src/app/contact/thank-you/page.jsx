'use client';

import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from '@/lib/brand';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Home, Mail, Phone, ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const styles = new Proxy({}, { get: () => '' });

export default function ThankYouPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [contactId, setContactId] = useState('');
  const [submittedAt, setSubmittedAt] = useState('');

  useEffect(() => {
    // Small delay to ensure stable rendering before checking authorization
    const checkAuthorization = () => {
      // Check if user came from successful form submission
      const contactSubmitted = sessionStorage.getItem('contactSubmitted');
      const contactIdFromStorage = sessionStorage.getItem('contactId');
      const submittedAtFromStorage =
        sessionStorage.getItem('contactSubmittedAt');

      if (contactSubmitted === 'true' && contactIdFromStorage) {
        // Check if submission is recent (within last 10 minutes)
        if (submittedAtFromStorage) {
          const submissionTime = new Date(submittedAtFromStorage);
          const now = new Date();
          const timeDiff = now - submissionTime;
          const tenMinutes = 10 * 60 * 1000;

          if (timeDiff <= tenMinutes) {
            setIsAuthorized(true);
            setContactId(contactIdFromStorage);
            setSubmittedAt(submissionTime.toLocaleString());
          } else {
            // Submission too old, redirect to contact page
            router.push('/contact');
          }
        } else {
          // No timestamp, redirect to contact page
          router.push('/contact');
        }
      } else {
        // No valid submission flag, redirect to contact page
        router.push('/contact');
      }
    };

    // Add a small delay to prevent race conditions
    const timer = setTimeout(checkAuthorization, 100);

    // Cleanup function to clear session storage when component unmounts
    return () => {
      clearTimeout(timer);
      // Clear session storage when leaving the page
      if (isAuthorized) {
        sessionStorage.removeItem('contactSubmitted');
        sessionStorage.removeItem('contactId');
        sessionStorage.removeItem('contactSubmittedAt');
      }
    };
  }, [router, isAuthorized]);

  // Show loading while checking authorization
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Verifying submission...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we confirm your contact form submission.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4 sm:mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/"
                className="hover:text-primary transition-colors"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Contact
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Thank You</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
            <CardContent className="p-4 sm:p-6 lg:p-8">
              <div className="text-center space-y-6">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-600" />
                </div>

                {/* Main Message */}
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    Message Sent Successfully!
                  </h1>
                  <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
                    Thank you for contacting us. We've received your message and
                    will get back to you soon.
                  </p>
                  {contactId && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm text-muted-foreground">
                      <span>Reference ID:</span>
                      <code className="font-mono font-medium text-foreground">
                        {contactId}
                      </code>
                    </div>
                  )}
                  {submittedAt && (
                    <p className="text-sm text-muted-foreground">
                      Submitted on {submittedAt}
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <h2 className="text-base font-semibold text-foreground">
                    Need immediate assistance?
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {SUPPORT_PHONE && (
                      <Button
                        asChild
                        variant="outline"
                        size="default"
                        className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                      >
                        <a href={SUPPORT_PHONE_HREF}>
                          <Phone className="w-4 h-4" />
                          Call {SUPPORT_PHONE}
                        </a>
                      </Button>
                    )}
                    <Button
                      asChild
                      variant="outline"
                      size="default"
                      className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                    >
                      <a href={`mailto:${SUPPORT_EMAIL}`}>
                        <Mail className="w-4 h-4" />
                        Email Us
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    size="default"
                    className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <Home className="w-4 h-4" />
                    Back to Home
                  </Button>
                  <Button
                    onClick={() => router.push('/shop')}
                    size="default"
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
