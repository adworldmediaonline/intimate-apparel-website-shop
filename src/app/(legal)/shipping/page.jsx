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
  CheckCircle,
  Clock,
  Globe,
  Mail,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Truck,
} from 'lucide-react';
import Link from 'next/link';
import { BRAND_NAME, SUPPORT_EMAIL } from '@/lib/brand';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('shipping');
  return buildPageMetadata('shipping', cmsData, {
    title: `Shipping Policy | ${BRAND_NAME} – Discreet Delivery Across India`,
    description: `${BRAND_NAME} ships across India in plain, discreet packaging. Read our processing times, courier partners and delivery timelines.`,
    keywords:
      "Unwrap Her shipping policy, lingerie, night suits, body suits, baby doll, bridal lingerie, silk lingerie, satin night wear, lace body stocking",
    canonical: '/shipping',
  });
}

export default function ShippingPage() {
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
                  Shipping Policy
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Shipping Policy
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Effective Date: {LEGAL_EFFECTIVE_DATE}
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At {BRAND_NAME}, we take pride in delivering
              your order safely and on time. Our
              goal is to ensure every order reaches you quickly, securely, and with
              full transparency.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* 1. Order Processing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock className="w-6 h-6 text-primary" />
                1. Order Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  Orders are processed Monday through Saturday, excluding
                  Sundays and public holidays.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  All orders placed before 2:00 PM IST are dispatched the same
                  business day.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  Orders placed after 2:00 PM IST are dispatched on the next
                  business day.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  During high-volume periods, including sales events and holidays,
                  orders may be processed and shipped on the next business day.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  For urgent or time-sensitive orders, please contact us before
                  placing your order to confirm availability and shipping times.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 2. Product Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <PackageCheck className="w-6 h-6 text-primary" />
                2. Product Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                We strive to maintain accurate inventory levels on our website.
              </p>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  Products that are not currently available will be marked as Out
                  of Stock.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  If an inventory discrepancy occurs after an order is placed, our
                  team will contact you promptly to discuss available options,
                  including waiting for restocking, selecting an alternative
                  product, or receiving a refund.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 3. Shipping Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Truck className="w-6 h-6 text-primary" />
                3. Shipping Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                We ship through reputed Indian courier partners so every parcel
                is trackable end to end. Every order goes out in plain, unmarked
                packaging with no indication of its contents on the outside.
              </p>

              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    Standard Shipping:
                  </h3>
                  <ul className="space-y-2 ml-7">
                    <li className="text-muted-foreground leading-relaxed">
                      • Standard shipping is automatically applied to most online
                      orders at checkout.
                    </li>
                    <li className="text-muted-foreground leading-relaxed">
                      • Metro cities usually receive orders in 2–4 business
                      days; other locations take 4–7 business days.
                    </li>
                    <li className="text-muted-foreground leading-relaxed">
                      • Remote pincodes and the North-East may take slightly
                      longer. Use the pincode checker on any product page to see
                      whether we deliver to you.
                    </li>
                  </ul>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <PackageCheck className="w-5 h-5 text-primary" />
                    Expedited Shipping:
                  </h3>
                  <p className="text-muted-foreground leading-relaxed ml-7 mb-2">
                    Express delivery is available on request for serviceable
                    pincodes.
                  </p>
                  <ul className="space-y-2 ml-7">
                    <li className="text-muted-foreground leading-relaxed">
                      • Contact us before placing the order so we can confirm
                      the timeline for your pincode.
                    </li>
                    <li className="text-muted-foreground leading-relaxed">
                      • Additional charges apply for expedited shipments.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Shipping Coverage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Globe className="w-6 h-6 text-primary" />
                4. Shipping Coverage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  We currently ship across India, to every pincode our courier
                  partners service.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground leading-relaxed">
                  All prices are in Indian Rupees and inclusive of GST. There
                  are no customs duties or import charges on a domestic order.
                </p>
              </div>
              <p className="font-semibold text-foreground">Discreet Packaging</p>
              <p className="text-muted-foreground leading-relaxed">
                Every order is despatched in an opaque, unbranded outer bag. The
                shipping label carries only the sender name and address — the
                contents, category and product names appear nowhere on the
                outside of the parcel.
              </p>
              <p className="font-semibold text-foreground">
                International Orders
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We do not ship outside India at present. If you would like an
                order delivered abroad, please contact us before placing it.
              </p>
            </CardContent>
          </Card>

          {/* 5. Large or Custom Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                5. Large or Custom Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                Bulk orders and bridal sets may need extra handling time,
                depending on stock.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For made-to-measure or customised pieces, our team will confirm
                the production and delivery timeline with you before we
                despatch.
              </p>
            </CardContent>
          </Card>

          {/* 6. Shipping Confirmation & Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <PackageCheck className="w-6 h-6 text-primary" />
                6. Shipping Confirmation & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                Once your order has shipped, you will receive a confirmation email
                with tracking details.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                You can track your shipment directly through the carrier's website
                for the most accurate delivery updates.
              </p>
            </CardContent>
          </Card>

          {/* 7. Delivery Inspection & Damages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="w-6 h-6 text-primary" />
                7. Delivery Inspection & Damages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Please inspect your order immediately upon arrival.
              </p>

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Report any of the following within 48 hours of delivery:
                </p>
                <ul className="space-y-2 ml-7">
                  <li className="text-muted-foreground leading-relaxed">
                    • Missing items from a set
                  </li>
                  <li className="text-muted-foreground leading-relaxed">
                    • Incorrect items
                  </li>
                  <li className="text-muted-foreground leading-relaxed">
                    • Visible shipping damage
                  </li>
                  <li className="text-muted-foreground leading-relaxed">
                    • Damaged packaging
                  </li>
                </ul>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Please photograph the parcel and the item before the packaging
                is discarded — it is what lets us raise the claim with the
                courier. Claims reported after 48 hours may not be eligible for
                replacement or refund, and {BRAND_NAME} is not responsible for
                damage resulting from handling after delivery.
              </p>
            </CardContent>
          </Card>

          {/* 8. Lost or Delayed Shipments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                8. Lost or Delayed Shipments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground leading-relaxed">
                If your shipment is lost or significantly delayed, please contact
                our support team.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We will work directly with the shipping carrier to investigate the
                issue and assist in resolving it as quickly as possible.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                If you have not received your package within 10 business days of
                the expected delivery date, please contact us. After verifying the
                shipment status with the carrier, we will provide a replacement
                shipment if the package is confirmed lost or cannot be delivered.
              </p>
            </CardContent>
          </Card>

          {/* 9. Contact Us */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Mail className="w-6 h-6 text-primary" />
                9. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                For shipping-related questions, order status inquiries, or urgent
                delivery requests, please contact us:
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Email:</p>
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>

                {/* No postal address is shown anywhere on this site, by decision. This block is kept only so the markup is here if that ever changes.
                <div className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Mailing Address:
                    </p>
                    <p className="leading-relaxed">
                      {BRAND_NAME}
                      <br />
                      {ADDRESS_LINE}
                    </p>
                  </div>
                </div>
                */}

                <div className="flex items-start gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Customer Support Hours:
                    </p>
                    <p className="leading-relaxed">
                      Monday – Saturday
                      <br />
                      10:00 AM – 6:00 PM IST
                    </p>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  Thank you for choosing {BRAND_NAME}.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <Card className="mt-12 text-center">
          <CardHeader>
            <CardTitle className="text-2xl lg:text-3xl mb-4">
              Ready to place an order?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg text-muted-foreground">
              Explore our full lineup at{' '}
              <Link
                href="/"
                className="text-primary hover:text-primary/80 transition-colors font-medium"
              >
                unwrapher.com
              </Link>{' '}
              and experience the {BRAND_NAME} difference.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/shop" className="flex items-center gap-2">
                Shop Now
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
