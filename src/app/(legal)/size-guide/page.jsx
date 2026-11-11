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
import { ArrowRight, Ruler, Shirt, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';
import {
  BETWEEN_SIZES_NOTE,
  BRA_SIZE_MAPPING,
  HOW_TO_MEASURE,
  SIZE_MEASUREMENTS,
  STRETCH_NOTE,
} from '@/lib/size-guide';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

/**
 * Standalone size guide, linked from the footer.
 *
 * Same content as the dialog on the product page — both read `lib/size-guide`,
 * so a size added in one place appears in the other.
 */
export async function generateMetadata() {
  const cmsData = await getPageMetadata('size-guide');
  return buildPageMetadata('size-guide', cmsData, {
    title: `Size Guide - ${BRAND_NAME}`,
    description: `Find your size at ${BRAND_NAME}: bust, waist and hip measurements in inches, a bra-size conversion, and how to measure yourself.`,
    canonical: '/size-guide',
  });
}

export default function SizeGuidePage() {
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
                  Size Guide
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
            Size Guide
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Take two minutes with a tape measure and you will not have to guess.
            Everything below is in inches.
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Ruler className="w-6 h-6 text-primary" />
                Size chart — measurements in inches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th scope="col" className="px-4 py-3 font-semibold">Size</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Bust</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Waist</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Hips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_MEASUREMENTS.map(row => (
                      <tr key={row.size} className="border-t border-border">
                        <th scope="row" className="px-4 py-3 text-left font-semibold text-foreground">
                          {row.size}
                        </th>
                        <td className="px-4 py-3 text-muted-foreground">{row.bust}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.waist}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Shirt className="w-6 h-6 text-primary" />
                Buying for her? Use her bra size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 text-left">
                      <th scope="col" className="px-4 py-3 font-semibold">Her bra size</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Pick</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BRA_SIZE_MAPPING.map(row => (
                      <tr key={row.bra} className="border-t border-border">
                        <th scope="row" className="px-4 py-3 text-left font-semibold text-foreground">
                          {row.bra}
                        </th>
                        <td className="px-4 py-3 text-muted-foreground">{row.pick}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-muted-foreground">{BETWEEN_SIZES_NOTE}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Sparkles className="w-6 h-6 text-primary" />
                How to measure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-4">
                {HOW_TO_MEASURE.map((step, i) => (
                  <li key={step.label} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">
                        {step.label}:
                      </span>{' '}
                      {step.body}
                    </span>
                  </li>
                ))}
              </ol>
              <p className="text-muted-foreground leading-relaxed">
                {STRETCH_NOTE} Still unsure,{' '}
                <Link
                  href="/contact"
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  get in touch
                </Link>{' '}
                and we will help you pick.
              </p>
              <p className="text-sm italic text-muted-foreground">
                Measurements are a guide. {BRAND_NAME} pieces are cut generously
                and most styles are highly stretchable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-8 text-center space-y-4">
              <p className="text-lg text-muted-foreground">
                Know your size? Everything is a few taps away.
              </p>
              <Button asChild size="lg">
                <Link href="/shop" className="inline-flex items-center gap-2">
                  Shop Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
