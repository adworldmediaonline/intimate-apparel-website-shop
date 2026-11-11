import Script from 'next/script';
import ContactPage from '../../components/version-tsx/contact/contact-form';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';
import { BRAND_NAME, SUPPORT_EMAIL } from '@/lib/brand';

const CONTACT_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Intimate Apparel',
  url: 'https://unwrapher.com/contact',
  description:
    "Get in touch with the Intimate Apparel team. We'd love to hear from you and help with any questions or concerns!",
  mainEntity: {
    '@type': 'Organization',
    name: BRAND_NAME,
    url: 'https://unwrapher.com/',
    contactPoint: {
      '@type': 'ContactPoint',
            contactType: 'Customer Service',
      email: SUPPORT_EMAIL,
      availableLanguage: 'English',
    },
  },
};

export async function generateMetadata() {
  const cmsData = await getPageMetadata('contact');
  return buildPageMetadata('contact', cmsData, {
    title: 'Contact Us - Unwrap Her',
    description:
      "Get in touch with Unwrap Her. Contact us with questions about our products or your order.",
    keywords: 'contact Unwrap Her, lingerie support, customer service',
    canonical: '/contact',
  });
}

export default function Contact() {
  const jsonLd = JSON.stringify(CONTACT_SCHEMA).replace(/</g, '\\u003c');

  return (
    <>
      <Script
        id="contact-schema"
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <ContactPage />
    </>
  );
}
