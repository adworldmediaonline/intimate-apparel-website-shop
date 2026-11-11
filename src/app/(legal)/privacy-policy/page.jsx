import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { LEGAL_EFFECTIVE_DATE } from '@/lib/legal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowRight,
  Cookie,
  Database,
  Eye,
  Lock,
  Mail,
  Scale,
  Share2,
  Shield,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';
import {
  ADDRESS_LINE,
  BRAND_NAME,
  LEGAL_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from '@/lib/brand';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

/**
 * Privacy policy.
 *
 * Written for Indian law: the Digital Personal Data Protection Act, 2023 and the
 * IT (Reasonable Security Practices and Sensitive Personal Data) Rules, 2011,
 * with the Grievance Officer the Consumer Protection (E-Commerce) Rules require.
 * Only describes data this store actually handles — orders, accounts, payment
 * through a gateway, and the analytics that are switched on in brand.config.json.
 */
export async function generateMetadata() {
  const cmsData = await getPageMetadata('privacy-policy');
  return buildPageMetadata('privacy-policy', cmsData, {
    title: `Privacy Policy - ${BRAND_NAME}`,
    description: `How ${BRAND_NAME} collects, uses and protects your personal data, and the rights you have under India's Digital Personal Data Protection Act, 2023.`,
    canonical: '/privacy-policy',
  });
}

const COLLECTED = [
  {
    label: 'Details you give us',
    body: 'Your name, delivery address, email address and phone number when you place an order or create an account.',
  },
  {
    label: 'Order information',
    body: 'What you bought, the size and colour you chose, the amount paid and the delivery status.',
  },
  {
    label: 'Payment information',
    body: 'Handled entirely by our payment gateway. We receive a confirmation and a reference number — we never see or store your full card number, CVV or UPI PIN.',
  },
  {
    label: 'Technical information',
    body: 'Your IP address, browser and device type, and the pages you visit, collected through cookies so the site works and we can see what needs improving.',
  },
];

const RIGHTS = [
  'Ask what personal data we hold about you and get a copy of it.',
  'Have anything inaccurate or incomplete corrected.',
  'Ask us to erase your data, where we are not required by law to keep it.',
  'Withdraw a consent you previously gave, at any time.',
  'Nominate someone to exercise these rights on your behalf if you are unable to.',
  'Complain to the Data Protection Board of India if you are not satisfied with our response.',
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
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
                  Privacy Policy
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Privacy Policy
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Effective Date: {LEGAL_EFFECTIVE_DATE}
          </Badge>
        </div>

        <Card className="mb-8">
          <CardContent className="pt-8 space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              {BRAND_NAME} is a brand operated by {LEGAL_NAME}, a registered
              business in India. Throughout this Privacy Policy, &quot;we&quot;,
              &quot;our&quot; and &quot;us&quot; refer to {LEGAL_NAME}, operating
              under the brand name {BRAND_NAME}. We respect your privacy and
              are committed to protecting your personal information. This policy
              explains what we collect when you shop with us, why we collect it,
              and what you can ask us to do with it.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We sell intimate apparel, and we understand that an order from us
              is private. We do not sell your data, we do not share your
              purchase history with advertisers, and every parcel leaves in
              plain, unbranded packaging.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Database className="w-6 h-6 text-primary" />
                1. What We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {COLLECTED.map(item => (
                <div key={item.label}>
                  <p className="font-semibold text-foreground">{item.label}</p>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Eye className="w-6 h-6 text-primary" />
                2. Why We Use It
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                We use your data only for the purposes you would expect:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-muted-foreground leading-relaxed">
                  • To process, pack and deliver your order, and to keep you
                  updated on it.
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • To raise a GST invoice, as the law requires.
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • To handle returns, exchanges and refunds.
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • To answer your questions when you contact us.
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • To keep the website secure and to understand which pages
                  need improving.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                We will only send you marketing messages if you have asked for
                them, and every one carries a way to stop them.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Share2 className="w-6 h-6 text-primary" />
                3. Who We Share It With
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                We share the minimum necessary, and only with parties who need
                it to complete your order:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="text-muted-foreground leading-relaxed">
                  • <span className="font-medium text-foreground">Courier partners</span>{' '}
                  — your name, address and phone number, so they can deliver.
                  They are told nothing about what is inside the parcel.
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • <span className="font-medium text-foreground">Payment gateways</span>{' '}
                  — to take the payment securely. They handle your card and UPI
                  details directly; we do not.
                </li>
                <li className="text-muted-foreground leading-relaxed">
                  • <span className="font-medium text-foreground">Authorities</span>{' '}
                  — only where we are legally required to disclose something.
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed font-medium text-foreground">
                We never sell your personal data, and we never share your
                purchase history for advertising.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Cookie className="w-6 h-6 text-primary" />
                4. Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                Cookies keep your cart and your login working between pages —
                without them the site cannot function. We also use them to
                understand which pages people find useful.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can block or delete cookies in your browser settings.
                Blocking the essential ones will stop the cart and checkout from
                working.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Lock className="w-6 h-6 text-primary" />
                5. How We Protect It
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                The site runs over HTTPS, passwords are stored hashed rather
                than in plain text, and access to order data is limited to the
                people who need it to fulfil your order.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                No system is perfectly secure. If a breach ever affects your
                data, we will notify you and the Data Protection Board of India
                as the law requires.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Database className="w-6 h-6 text-primary" />
                6. How Long We Keep It
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                We retain order and invoice records for the periods required
                under applicable tax, accounting and other laws. Account
                information is retained as necessary to provide our services and
                meet legal obligations. You may request the deletion of eligible
                personal data by contacting us.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <UserCheck className="w-6 h-6 text-primary" />
                7. Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                Under the Digital Personal Data Protection Act, 2023 you can:
              </p>
              <ul className="space-y-2 ml-4">
                {RIGHTS.map(right => (
                  <li key={right} className="text-muted-foreground leading-relaxed">
                    • {right}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground leading-relaxed">
                To exercise any of these, write to us at the address below. We
                will respond within 30 days.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shield className="w-6 h-6 text-primary" />
                8. Children
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                This store is for adults. We do not knowingly sell to, or
                collect data from, anyone under 18. If you believe a child has
                given us their data, tell us and we will delete it.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Scale className="w-6 h-6 text-primary" />
                9. Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                We may update this policy as our practices or the law change.
                The effective date at the top always shows the current version.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Mail className="w-6 h-6 text-primary" />
                10. Contact & Grievance Officer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                For any question about your data, or to make a complaint, our
                Grievance Officer under the Consumer Protection (E-Commerce)
                Rules, 2020 and the IT Rules, 2021 is reachable at:
              </p>

              <div className="bg-muted/50 rounded-lg p-6 space-y-2">
                <p className="font-semibold text-foreground">{BRAND_NAME} (Brand)</p>
                <p className="text-muted-foreground">
                  Legal Business Name: {LEGAL_NAME}
                </p>
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
                {ADDRESS_LINE && (
                  <p className="text-muted-foreground">
                    Business Address: {ADDRESS_LINE}.
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
                We acknowledge every complaint within 48 hours and aim to
                resolve it within one month.
              </p>

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
