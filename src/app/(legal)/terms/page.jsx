import {
  BRAND_NAME,
  CURRENCY,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from '@/lib/brand';
import { Badge } from '@/components/ui/badge';
import { LEGAL_EFFECTIVE_DATE } from '@/lib/legal';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertTriangle,
  ArrowRight,
  Copyright,
  IndianRupee,
  FileText,
  Mail,
  MapPin,
  Phone,
  Scale,
  Shield,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('terms');
  return buildPageMetadata('terms', cmsData, {
    title: `Terms of Use - ${BRAND_NAME}`,
    description: `Read the terms of use governing purchases from ${BRAND_NAME} in India.`,
    canonical: '/terms',
  });
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb Navigation */}
        <div className="mb-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  className="text-muted-foreground hover:text-foreground"
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">
                  Terms of Use
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Terms of Use
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Effective Date: {LEGAL_EFFECTIVE_DATE}
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <div className="space-y-4">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to {BRAND_NAME}, a brand operated by {LEGAL_NAME}{' '}
                ("Company," "we," "our," or "us"). These Terms of Use
                ("Terms") govern your use of our website
                located at unwrapher.com and every purchase made through it.
                They are an electronic record under the Information Technology
                Act, 2000 and the rules made under it, and do not require a
                physical or digital signature.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                By accessing or using the Website, you agree to be bound by
                these Terms. If you do not agree, you may not use our Website.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Use of Website Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="w-6 h-6 text-primary" />
                1. Use of Website
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                You agree to use our Website for lawful purposes only. You may
                not use our Website:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    To violate any applicable laws or regulations.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    To infringe the rights of others, including intellectual
                    property rights.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    To upload or transmit viruses, malware, or harmful code.
                  </span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to restrict or terminate your access to the
                Website at any time without notice if you violate these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Copyright className="w-6 h-6 text-primary" />
                2. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                All content on this Website, including text, graphics, logos,
                images, videos, and software, is the property of {BRAND_NAME} or
                its licensors, and is protected by the Copyright Act, 1957, the
                Trade Marks Act, 1999 and other applicable Indian and
                international intellectual property laws.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You may not use, copy, modify, distribute, or reproduce any
                content without our prior written permission.
              </p>
            </CardContent>
          </Card>

          {/* Product Information and Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <IndianRupee className="w-6 h-6 text-primary" />
                3. Product Information and Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We make every effort to ensure the accuracy of product
                descriptions, images, pricing, and availability. However, we do
                not guarantee that all information on our Website is complete,
                current, or error-free.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to correct any errors, update information,
                or cancel orders if any information is inaccurate at any time
                without prior notice.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <IndianRupee className="w-6 h-6 text-primary" />
                4. Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Available payment methods, the total payable amount and any
                applicable advance payment are displayed at checkout before an
                order is placed. Online payments are processed securely through
                third-party payment gateways. We do not store your full card
                number, CVV or UPI PIN.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                All prices are listed in Indian Rupees ({CURRENCY}) and are
                inclusive of GST unless stated otherwise on the product page.
                A GST invoice is issued with every order.
              </p>
            </CardContent>
          </Card>

          {/* Shipping and Returns Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Truck className="w-6 h-6 text-primary" />
                5. Shipping and Returns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Our shipping, delivery, return, exchange and refund procedures
                are explained in our separate{' '}
                <Link
                  href="/shipping"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Shipping Policy
                </Link>{' '}
                and{' '}
                <Link
                  href="/returns"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Returns &amp; Refunds Policy
                </Link>
                . Customers are encouraged to review these policies before
                placing an order. By placing an order, you agree to the
                applicable terms and conditions outlined in these policies.
              </p>
            </CardContent>
          </Card>

          {/* Disclaimer of Warranties Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="w-6 h-6 text-primary" />
                6. Disclaimer of Warranties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Our Website and products are provided on an "as-is" and
                "as-available" basis.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We disclaim all warranties, express or implied, including
                warranties of merchantability, fitness for a particular purpose,
                and non-infringement.
              </p>
            </CardContent>
          </Card>

          {/* Limitation of Liability Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Scale className="w-6 h-6 text-primary" />
                7. Limitation of Liability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To the extent permitted by law, {BRAND_NAME}, its directors,
                employees, or agents shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising
                out of your use of the Website or the products purchased through
                the Website. Nothing in these Terms limits any right you have as
                a consumer under the Consumer Protection Act, 2019.
              </p>
            </CardContent>
          </Card>

          {/* Indemnification Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="w-6 h-6 text-primary" />
                8. Indemnification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify, defend, and hold harmless {BRAND_NAME}{' '}
                from any claims, damages, losses, liabilities, and expenses
                (including legal fees) arising from your use of the Website or
                violation of these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Governing Law Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Scale className="w-6 h-6 text-primary" />
                9. Governing Law
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and construed in accordance
                with the laws of India. Subject to the Consumer Protection Act,
                2019 — which allows a consumer to approach the District, State
                or National Consumer Disputes Redressal Commission having
                jurisdiction over their own residence — the courts in India
                shall have exclusive jurisdiction over any dispute arising from
                these Terms.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="w-6 h-6 text-primary" />
                10. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to update or modify these Terms at any time
                without prior notice.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Your continued use of the Website after changes means you accept
                the revised Terms.
              </p>
            </CardContent>
          </Card>

          {/* Grievance Redressal Section - required of every e-commerce entity
              by Rule 4(5) of the Consumer Protection (E-Commerce) Rules, 2020. */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Scale className="w-6 h-6 text-primary" />
                11. Grievance Redressal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                In accordance with the Consumer Protection (E-Commerce) Rules,
                2020 and the Information Technology (Intermediary Guidelines)
                Rules, 2021, any complaint about an order, a product or your
                personal data may be sent to our Grievance Officer:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                <p className="font-semibold text-foreground">Grievance Officer</p>
                {SUPPORT_EMAIL && (
                  <p className="text-muted-foreground">
                    Email:{' '}
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </p>
                )}
                {SUPPORT_PHONE && (
                  <p className="text-muted-foreground">
                    Phone:{' '}
                    <a
                      href={SUPPORT_PHONE_HREF}
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {SUPPORT_PHONE}
                    </a>
                  </p>
                )}
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We acknowledge every complaint within 48 hours of receipt and
                aim to resolve it within one month, as those Rules require.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                For any questions about these Terms, please contact us at:
              </p>

              <div className="bg-muted/50 rounded-lg p-6">
                <div className="text-center space-y-4">
                  <h4 className="font-semibold text-foreground">
                    {BRAND_NAME}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      <a
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        {SUPPORT_EMAIL}
                      </a>
                    </div>
                    {SUPPORT_PHONE && (
                      <div className="flex items-center justify-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        <a
                          href={SUPPORT_PHONE_HREF}
                          className="text-primary hover:text-primary/80 transition-colors font-medium"
                        >
                          {SUPPORT_PHONE}
                        </a>
                      </div>
                    )}
                    {/* No postal address is shown anywhere on this site, by decision. This block is kept only so the markup is here if that ever changes.
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{ADDRESS_LINE}</span>
                    </div>
                    */}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Button asChild size="lg">
                  <Link href="/contact" className="flex items-center gap-2">
                    Contact Us
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
