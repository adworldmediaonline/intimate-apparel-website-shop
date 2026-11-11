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
import { ArrowRight, Heart, PackageCheck, Ruler, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';
import brand from '@/lib/brand';

/**
 * About page.
 *
 * Written from what is actually true of this catalogue — the fabrics, the
 * categories, the discreet despatch, the India-wide delivery. Deliberately no
 * founding date, founder name, customer counts or awards: those would have to be
 * invented, and an About page that opens with a fabricated fact is worse than a
 * short one.
 */
export async function generateMetadata() {
  const cmsData = await getPageMetadata('about');
  return buildPageMetadata('about', cmsData, {
    title: `About Us - ${brand.identity.name}`,
    description: `${brand.identity.name} makes silk, satin and lace lingerie, night suits, body suits and bridal intimate wear, delivered discreetly across India.`,
    canonical: '/about',
  });
}

const PILLARS = [
  {
    icon: Sparkles,
    title: 'Fabric first',
    body: 'Silk, satin and lace, chosen for how they feel against skin through a whole evening — not just for how they photograph. Soft linings, finished seams, and hardware that sits flat.',
  },
  {
    icon: Ruler,
    title: 'A fit you can trust',
    body: 'Every piece carries its own measurements on the product page rather than a single vague size chart. If the size is wrong, exchange it once within 7 days.',
  },
  {
    icon: PackageCheck,
    title: 'Discreet, always',
    body: 'Orders leave in plain, unbranded packaging. Nothing on the outside of the parcel names the contents, the category or the store.',
  },
  {
    icon: Heart,
    title: 'For you, not an audience',
    body: 'Lounge sets you would happily wear on an ordinary Tuesday, and bridal pieces made for one particular night. Both belong here.',
  },
];

export default function AboutPage() {
  const name = brand.identity.name;

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
                  About Us
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            About {name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {brand.identity.tagline}.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="py-8 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              {name} is an intimate apparel label for women in India. We make
              lingerie, night suits, body suits, baby dolls, lace and body
              stockings, role-play sets and bridal intimate wear — in silk,
              satin and lace.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Buying lingerie in India has long meant one of two compromises: a
              shop counter where you cannot really look, or an online listing
              that tells you almost nothing about the fabric and even less about
              the fit. We built {name} to remove both. Every piece is
              photographed as it actually is, described in plain language, and
              sent to you in packaging that gives nothing away.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We are a small team, and we read the messages ourselves. If
              something does not fit, does not arrive, or simply is not what you
              expected, write to us and a person will answer.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          {PILLARS.map(pillar => {
            const Icon = pillar.icon;
            return (
              <Card key={pillar.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Icon className="w-5 h-5 text-primary" />
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {pillar.body}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardContent className="py-8 space-y-4">
            <h2 className="text-xl font-semibold text-foreground">
              How we ship
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Orders placed before 2:00 PM IST are despatched the same business
              day, across India, through trackable courier partners. Metro
              cities usually receive their parcel in 2–4 business days. You can
              check delivery to your pincode from any product page.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Read the full{' '}
              <Link
                href="/shipping"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                shipping policy
              </Link>{' '}
              and{' '}
              <Link
                href="/returns"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                returns policy
              </Link>
              , including the hygiene rules that apply to intimate apparel.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild size="lg">
                <Link href="/shop" className="flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
