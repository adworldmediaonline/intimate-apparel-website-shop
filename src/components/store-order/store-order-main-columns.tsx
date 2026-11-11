'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { StoreOrderDocument } from '@/types/store-order';
import {
  CheckCircle,
  Copy,
  CreditCard,
  IndianRupee,
  Mail,
  ShoppingCart,
  User,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import {
  computeCartSubtotal,
  computeOrderDiscountBreakdown,
  type OrderDiscountBreakdown,
} from './store-order-utils';

interface StoreOrderMainColumnsProps {
  order: StoreOrderDocument;
  breakdown: OrderDiscountBreakdown;
}

export const StoreOrderMainColumns = ({
  order,
  breakdown,
}: StoreOrderMainColumnsProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cart = order.cart ?? [];
  const subtotal = computeCartSubtotal(order);
  const shippingCost = Number(order.shippingCost ?? 0);
  const orderTaxAmount = Number(order.taxAmount ?? 0);
  const orderTotalAmount = order.totalAmount;
  const firstTimeDiscount = order.firstTimeDiscount;
  const discount = Number(order.discount ?? 0);

  const {
    firstTimeDiscountAmount,
    couponDiscounts,
    couponDisplayText,
    otherDiscounts,
  } = breakdown;

  const name = order.name ?? '';
  const email = order.email;
  const contact = order.contact ?? '';
  const city = order.city ?? '';
  const country = order.country ?? '';
  const paymentMethod = order.paymentMethod ?? '';
  // Anything unrecognised used to fall through to "Credit Card", which would
  // have labelled a part payment as a card charge.
  const partial = order.partialPayment;
  const paymentMethodLabel =
    paymentMethod === 'COD'
      ? 'Cash on Delivery'
      : paymentMethod === 'Partial'
        ? `Part payment — ${partial?.percent ?? 0}% paid online`
        : paymentMethod === 'PayPal' || paymentMethod === 'Razorpay'
          ? paymentMethod
          : paymentMethod === 'Free Order' ||
            paymentMethod === 'Free Order (100% Discount)'
            ? 'Free Order'
            : 'Credit Card';
  const PaymentMethodIcon = paymentMethod === 'PayPal' || paymentMethod === 'Razorpay' ? Wallet : CreditCard;
  const paymentIntent = order.paymentIntent;

  const handleCopyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // clipboard may be denied
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" aria-hidden />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {cart.length} item{cart.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{CURRENCY_SYMBOL}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">
                {CURRENCY_SYMBOL}{parseFloat(shippingCost.toFixed(2)).toFixed(2)}
              </span>
            </div>

            {(firstTimeDiscount?.isApplied ||
              (!firstTimeDiscount?.isApplied &&
                discount > 0 &&
                Math.abs(discount - subtotal * 0.1) < 0.01)) &&
            firstTimeDiscountAmount > 0 ? (
              <div className="flex justify-between items-center text-green-600">
                <span className="flex items-center gap-2">
                  First-time order discount (-
                  {firstTimeDiscount?.percentage ?? 10}%)
                </span>
                <span className="font-medium">
                  -{CURRENCY_SYMBOL}{firstTimeDiscountAmount.toFixed(2)}
                </span>
              </div>
            ) : null}

            {couponDiscounts > 0 ? (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-muted-foreground">
                  {couponDisplayText}
                </span>
                <span className="font-medium">
                  -{CURRENCY_SYMBOL}{couponDiscounts.toFixed(2)}
                </span>
              </div>
            ) : null}

            {otherDiscounts > 0 ? (
              <div className="flex justify-between items-center text-green-600">
                <span className="text-muted-foreground">Other Discounts</span>
                <span className="font-medium">
                  -{CURRENCY_SYMBOL}{otherDiscounts.toFixed(2)}
                </span>
              </div>
            ) : null}

            {orderTaxAmount > 0 ? (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium">
                  {CURRENCY_SYMBOL}{orderTaxAmount.toFixed(2)}
                </span>
              </div>
            ) : null}
          </div>

          <Separator />

          <div className="border-t border-border pt-3 mt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-foreground">Total</span>
              <span className="text-lg font-semibold text-foreground">
                ₹
                {(
                  orderTotalAmount ??
                  subtotal +
                    shippingCost -
                    firstTimeDiscountAmount -
                    couponDiscounts -
                    otherDiscounts +
                    orderTaxAmount
                ).toFixed(2)}
              </span>
            </div>
            {/* On a part payment the Total above is not what was charged, so
                the split is spelled out rather than left to be worked out. */}
            {partial && (
              <div className="mt-3 space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Paid online ({partial.percent}%)
                  </span>
                  <span className="font-medium text-foreground">
                    ₹{Number(partial.paidAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {partial.balanceCollected ? 'Balance collected' : 'Pay in cash on delivery'}
                  </span>
                  <span className="font-semibold text-foreground">
                    ₹{Number(partial.balanceDue).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" aria-hidden />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" aria-hidden />
                Contact Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Name</span>
                  <span className="font-medium text-right">{name}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-right break-all">
                    {email || contact}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="font-medium text-right">{contact}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                Delivery
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right">
                    {city}, {country}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="font-medium flex items-center gap-2 shrink-0">
                    <PaymentMethodIcon className="w-4 h-4" aria-hidden />
                    {paymentMethodLabel}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {['Card', 'PayPal', 'Razorpay'].includes(paymentMethod) && paymentIntent?.id ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" aria-hidden />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" aria-hidden />
                  Transaction Information
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Transaction ID
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 shrink-0"
                        onClick={() =>
                          handleCopyToClipboard(paymentIntent.id!, 'transactionId')
                        }
                        aria-label="Copy Transaction ID"
                      >
                        {copiedField === 'transactionId' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" aria-hidden />
                        ) : (
                          <Copy className="w-4 h-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                    <div className="bg-muted/50 p-2 rounded-md">
                      <span className="font-medium font-mono text-xs break-all">
                        {paymentIntent.id}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Currency</span>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-primary" aria-hidden />
                      <span className="font-medium uppercase">
                        {paymentIntent.currency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" aria-hidden />
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground">Email</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium truncate">
                        {email || contact}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 shrink-0"
                        onClick={() =>
                          handleCopyToClipboard(
                            email || contact,
                            'email'
                          )
                        }
                        aria-label="Copy Email"
                      >
                        {copiedField === 'email' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" aria-hidden />
                        ) : (
                          <Copy className="w-4 h-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
