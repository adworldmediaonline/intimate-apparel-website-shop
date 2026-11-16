import {
  BRAND_NAME,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from '@/lib/brand';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LEGAL_EFFECTIVE_DATE } from '@/lib/legal';
import { Badge } from '@/components/ui/badge';
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
  Clock,
  Mail,
  MapPin,
  Package,
  Phone,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { getPageMetadata } from '@/server/page-metadata';
import { buildPageMetadata } from '@/lib/build-page-metadata';

export async function generateMetadata() {
  const cmsData = await getPageMetadata('returns');
  return buildPageMetadata('returns', cmsData, {
    title: `Returns - ${BRAND_NAME}`,
    description: `${BRAND_NAME} returns policy, hygiene rules and refund timelines for orders in India.`,
    canonical: '/returns',
  });
}

export default function ReturnsPage() {
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
                  Returns
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Refund and Return Policy
          </h1>
          <Badge variant="secondary" className="text-base px-4 py-2">
            Effective Date: {LEGAL_EFFECTIVE_DATE}
          </Badge>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardContent className="pt-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              At {BRAND_NAME}, your satisfaction is important to us. If
              something is not right with your order, this policy explains what
              you can return, by when, and how quickly the money reaches you.
              Because we sell intimate apparel, some hygiene rules apply — they
              are set out in full below so there are no surprises.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {/* Return Period Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Clock className="w-6 h-6 text-primary" />
                1. Return Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                For eligible items, you may request a return or size exchange
                within{' '}
                <span className="font-semibold text-foreground">7 days</span>{' '}
                after delivery, subject to the hygiene and eligibility
                conditions below. A 7-day request window does not mean that
                every order qualifies for a refund. Refunds are available where
                an incorrect, damaged or faulty item is supplied, where an order
                is confirmed undelivered or cannot be fulfilled, where a
                replacement promised under this policy is unavailable, or where
                required by applicable law. This time limit does not restrict
                any statutory consumer right.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-3">
                If your parcel arrived damaged, or the item inside is not what
                you ordered, tell us within{' '}
                <span className="font-semibold text-foreground">48 hours</span>{' '}
                of delivery and send a photograph of the item and its packaging.
                We will replace it or refund it in full, including shipping.
              </p>
            </CardContent>
          </Card>

          {/* Return Conditions Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                2. Return Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Items must be unworn, unwashed and free of any stains,
                    perfume, deodorant or make-up marks.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    All original tags, labels, hygiene seals and packaging must
                    be intact and attached.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Please try the piece on over your own innerwear. Returns
                    that arrive worn, washed, damaged or with a broken hygiene
                    seal will be sent back to you and cannot be refunded.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Size Exchange Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <RefreshCw className="w-6 h-6 text-primary" />
                3. Size Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    If the size is wrong, you can exchange the item once within
                    7 days of delivery, subject to the same hygiene conditions
                    above and to the replacement size being in stock.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    We charge no restocking fee on any return or exchange.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    If the requested replacement size is unavailable, we will
                    contact you to offer another suitable size or item. If no
                    suitable replacement can be provided, we will offer a refund
                    to your original payment method, subject to the conditions
                    that applied when you placed the order and applicable law.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Non-Returnable Items Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="w-6 h-6 text-primary" />
                4. Non-Returnable Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed mb-3">
                For hygiene and safety reasons, the following items are
                generally not eligible for routine returns or exchanges once
                unsealed. This restriction does not apply where the item
                supplied is damaged, faulty or incorrect, or where a remedy is
                required under applicable consumer protection law:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Any item whose hygiene seal or tag has been removed or
                    broken
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Briefs, thongs, bodystockings and other intimate pieces
                    once unsealed
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Items altered, customised or made to your measurements
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="destructive" className="mt-1">
                    ✗
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Any item sold as "Non Returnable" or bought in a clearance
                    sale
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* How to Start a Return Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Mail className="w-6 h-6 text-primary" />
                5. How to Start a Return
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                To initiate a return, please contact us at:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Email:
                    </span>
                    <br />
                    <a
                      href={`mailto:${SUPPORT_EMAIL}`}
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {SUPPORT_EMAIL}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      Phone:
                    </span>
                    <br />
                    {SUPPORT_PHONE ? (
                      <a
                        href={SUPPORT_PHONE_HREF}
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        {SUPPORT_PHONE}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">Not available</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  We will provide you with a Return Authorization (RA) number
                  and instructions for sending your item back.
                </p>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Returns without a valid RA number will not be accepted.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Refund Processing Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <RefreshCw className="w-6 h-6 text-primary" />
                6. Refund Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Approved physical returns are refunded to the original
                    payment method after receipt and inspection. If payment was
                    captured but an order was not recorded, we will verify the
                    transaction and request missing product and delivery
                    details. No refund is initiated solely due to customer
                    non-confirmation while the order remains on hold, except
                    where a refund is required by law or we cannot fulfil the
                    transaction.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    We initiate the refund within{' '}
                    <span className="font-semibold text-foreground">
                      3 business days
                    </span>{' '}
                    of the returned item passing inspection.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ✓
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    UPI refunds usually appear within 1–3 business days; card
                    refunds take 5–7 business days to show on your statement,
                    depending on your bank.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Refunds are always made to the original payment method. GST
                    charged on the item is refunded with it.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Shipping charges are non-refundable, except where the item
                    arrived damaged, faulty or incorrect.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* 6A. Payment Received, but Order Not Created or Not Confirmed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <AlertTriangle className="w-6 h-6 text-primary" />
                6A. Payment Received, but Order Not Created or Not Confirmed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                If a payment is captured but no complete order is recorded,{' '}
                {BRAND_NAME} will contact the customer to confirm product names
                or links, sizes, colours and delivery details. The customer must
                provide these details to process the order. Until they are
                confirmed, dispatch remains on hold. As per our standard policy,
                we will not initiate a refund solely because the customer has
                not provided or confirmed the required details despite follow-up
                requests. We will keep requesting the information to complete
                the order. This rule does not remove any remedy required by
                applicable law, including where a technical failure prevents
                fulfilment. No additional payment is due for an amount already
                received.
              </p>
              {SUPPORT_EMAIL && (
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Contact{' '}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    {SUPPORT_EMAIL}
                  </a>{' '}
                  for support.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Return Shipping Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <Package className="w-6 h-6 text-primary" />
                7. Return Shipping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Where our courier partner services your pincode we will
                    arrange a reverse pickup; otherwise you may self-ship the
                    item to the address we share with your return
                    authorisation.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    Return shipping is on us when an item arrives damaged,
                    faulty or incorrect. For an otherwise eligible size exchange
                    or customer-requested return not caused by our error, return
                    shipping is borne by the customer unless otherwise required
                    by law. For a confirmed non-delivery or payment-captured
                    with no order case, no return shipment is required.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    We recommend using a trackable shipping service and
                    purchasing shipping insurance.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">
                    ℹ
                  </Badge>
                  <span className="text-muted-foreground leading-relaxed">
                    We are not responsible for returns lost in transit.
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">
                Need help or have questions about your return?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground text-center">
                Contact us anytime — we're happy to assist you!
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
                    Contact Support
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
