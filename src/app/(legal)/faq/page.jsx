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
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { BRAND_NAME, CURRENCY_SYMBOL, LEGAL_NAME, SUPPORT_EMAIL } from '@/lib/brand';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

/**
 * FAQ.
 *
 * Every answer here matches what the shipping, returns and size-guide pages
 * actually say — 7-day returns, 48-hour damage window, 2:00 PM IST dispatch,
 * S-XL sizing. If one of those policies changes, change it here too.
 *
 * Emits FAQPage JSON-LD so the questions are eligible for rich results.
 */
export async function generateMetadata() {
  const cmsData = await getPageMetadata('faq');
  return buildPageMetadata('faq', cmsData, {
    title: `FAQ - ${BRAND_NAME}`,
    description: `Answers about discreet packaging, delivery times, sizing, returns and payment at ${BRAND_NAME}.`,
    canonical: '/faq',
  });
}

const SECTIONS = [
  {
    heading: 'Ordering & Privacy',
    items: [
      {
        q: 'Is the packaging discreet?',
        a: 'Yes, always. Every order leaves in a plain, unbranded outer bag. The shipping label carries only the sender name and address — nothing on the outside of the parcel names the contents, the category or the store.',
      },
      {
        q: 'Will the product name show on my bank statement?',
        a: `Your bank or payment statement may display ${LEGAL_NAME}, the legal business operating ${BRAND_NAME}, or the payment gateway's transaction descriptor. We do not include individual product names in the payment description provided by us.`,
      },
      {
        q: 'Do I need an account to order?',
        a: 'No. You can check out as a guest. An account simply saves your address and lets you track past orders.',
      },
    ],
  },
  {
    heading: 'Sizing',
    items: [
      {
        q: 'What sizes do you carry?',
        a: 'S, M, L and XL across the range. The size guide has bust, waist and hip measurements in inches, plus a bra-size conversion if you are buying for someone else.',
      },
      {
        q: 'I am between two sizes. Which should I take?',
        a: 'Take the larger one. Our fabrics stretch, and lace is forgiving — size down for a snugger fit, up for comfort.',
      },
      {
        q: 'Can I exchange if the size is wrong?',
        a: 'Yes. You can exchange an eligible item once within 7 days of delivery, provided the hygiene seal and tags are intact and the replacement size is in stock.',
      },
    ],
  },
  {
    heading: 'Delivery',
    items: [
      {
        q: 'How long will my order take?',
        a: 'Orders placed before 2:00 PM IST are dispatched the same business day. Metro cities usually receive them in 2–4 business days; other locations take 4–7. You can check delivery to your pincode from any product page.',
      },
      {
        q: 'Do you deliver everywhere in India?',
        a: 'We ship to every pincode our courier partners service. We do not ship outside India at present.',
      },
      {
        q: 'Is there a delivery charge?',
        a: 'Standard shipping is free on all orders within India. If an expedited shipping option is available and selected, any additional delivery charges will be clearly displayed at checkout before payment.',
      },
    ],
  },
  {
    heading: 'Payment',
    items: [
      {
        q: 'How can I pay?',
        a: 'You can pay securely using the payment methods available at checkout. Online transactions are processed through a secure payment gateway. We do not store your full card number, CVV or UPI PIN.',
      },
      {
        q: 'Are prices inclusive of tax?',
        a: `Yes. Every price is in Indian Rupees (${CURRENCY_SYMBOL}) and inclusive of GST. A GST invoice is issued with every order.`,
      },
    ],
  },
  {
    heading: 'Returns & Refunds',
    items: [
      {
        q: 'What can I return?',
        a: 'Anything unworn and unwashed, within 7 days of delivery, with tags and the hygiene seal intact. For hygiene reasons we cannot accept an item once its seal is broken.',
      },
      {
        q: 'My order arrived damaged or wrong. What now?',
        a: 'Tell us within 48 hours of delivery and send a photograph of the item and its packaging. We will replace it or refund it in full, including shipping.',
      },
      {
        q: 'How quickly do refunds reach me?',
        a: 'Once an eligible returned item passes inspection, we initiate the approved refund within 3 business days. The time required for the refunded amount to appear in your account depends on your original payment method, bank and payment provider.',
      },
      {
        q: 'Who pays for return shipping?',
        a: 'We do, when the item arrived damaged, faulty or incorrect. For a change of mind, the cost is yours.',
      },
    ],
  },
];

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: SECTIONS.flatMap(section =>
    section.items.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    }))
  ),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
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
                  FAQ
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            The things people ask us most. If your question is not here, write
            to us and a person will answer.
          </p>
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <Card key={section.heading}>
              <CardHeader>
                <CardTitle className="text-xl">{section.heading}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.items.map(item => (
                  <div key={item.q} className="space-y-1.5">
                    <h3 className="font-semibold text-foreground">{item.q}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                Still have a question?
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg">
                  <Link href="/contact" className="inline-flex items-center gap-2">
                    Contact Us
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                {SUPPORT_EMAIL && (
                  <Button asChild size="lg" variant="outline">
                    <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
