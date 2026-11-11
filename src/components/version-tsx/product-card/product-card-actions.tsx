'use client';

import { isOutOfStock } from '@/lib/product-stock';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { Eye, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { CURRENCY_SYMBOL } from '@/lib/brand';

export interface ProductOption {
  title: string;
  price: number;
}

export interface ProductCardActionsProps {
  product: { _id: string; title: string; quantity?: number | null; slug?: string; options?: ProductOption[] };
  hasConfigurations: boolean;
  selectedOption: ProductOption | null;
  onOptionChange: (value: string) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  onChooseOptions: (e: React.MouseEvent) => void;
  onDecrementFromCart?: (e: React.MouseEvent) => void;
  onRemoveFromWishlist?: (e: React.MouseEvent) => void;
  isAddedToCart: boolean;
  cartQuantity?: number;
  variant?: 'shop' | 'related' | 'search' | 'wishlist';
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export function ProductCardActions({
  product,
  hasConfigurations,
  selectedOption,
  onOptionChange,
  onAddToCart,
  onChooseOptions,
  onDecrementFromCart,
  onRemoveFromWishlist,
  isAddedToCart,
  cartQuantity = 0,
  variant = 'shop',
  layout = 'vertical',
  className = '',
}: ProductCardActionsProps) {
  const hasOptions = product.options && product.options.length > 0;
  const productSlug = product.slug || product._id;
  const outOfStock = isOutOfStock(product);

  if (variant === 'wishlist' && layout === 'horizontal') {
    return (
      <div className={`flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 ${className}`}>
        {hasOptions && (
          <div className="w-full max-w-xs">
            <Select
              onValueChange={onOptionChange}
              value={
                selectedOption
                  ? (() => {
                      const idx = product.options!.findIndex(
                        (opt) =>
                          opt.title === selectedOption.title &&
                          Number(opt.price) === Number(selectedOption.price)
                      );
                      return idx >= 0 ? idx.toString() : '';
                    })()
                  : ''
              }
            >
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Select option..." />
              </SelectTrigger>
              <SelectContent>
                {product.options!.map((option, index) => (
                  <SelectItem key={index} value={index.toString()} className="text-xs">
                    {option.title}
                    {option.price && Number(option.price) !== 0
                      ? ` (+${CURRENCY_SYMBOL}${Number(option.price).toFixed(2)})`
                      : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex items-center border-2 border-border rounded-lg overflow-hidden bg-background">
            <Button
              variant="ghost"
              size="sm"
              onClick={onDecrementFromCart}
              className="h-8 w-8 p-0 rounded-none border-r border-border hover:bg-muted/50 transition-colors"
              disabled={!isAddedToCart || cartQuantity <= 0}
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="px-3 py-1 text-sm font-semibold min-w-[2.5rem] text-center bg-muted/30">
              {cartQuantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddToCart}
              className="h-8 w-8 p-0 rounded-none border-l border-border hover:bg-muted/50 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                isAddedToCart ? 'bg-green-500' : 'bg-muted-foreground/30'
              }`}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {isAddedToCart ? 'In Cart' : 'Not in Cart'}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasConfigurations ? (
            <Button
              onClick={onChooseOptions}
              className="flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium"
              disabled={outOfStock}
              size="sm"
            >
              <Eye className="w-4 h-4" />
              View Product
            </Button>
          ) : (
            <Button
              onClick={onAddToCart}
              className="flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium"
              disabled={outOfStock}
              size="sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {isAddedToCart ? 'Update' : 'Add to Cart'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            asChild
            className="px-4 py-2 h-auto text-sm font-medium"
          >
            <Link href={`/product/${productSlug}`} className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View
            </Link>
          </Button>

          {onRemoveFromWishlist && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemoveFromWishlist}
              className="flex items-center gap-2 px-4 py-2 h-auto text-sm font-medium text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-auto pt-2 sm:pt-3 ${className}`}>
      {hasOptions && (
        <div className="mb-2 sm:mb-3">
          <Select
            onValueChange={onOptionChange}
            value={
              selectedOption
                ? product.options!.indexOf(selectedOption).toString()
                : ''
            }
          >
            <SelectTrigger className="w-full h-7 text-[10px] sm:h-8 sm:text-xs">
              <SelectValue placeholder="Select option..." />
            </SelectTrigger>
            <SelectContent>
              {product.options!.map((option, index) => (
                <SelectItem
                  key={index}
                  value={index.toString()}
                  className="text-[10px] sm:text-xs"
                >
                  {option.title}
                  {option.price && Number(option.price) !== 0
                    ? ` (+${CURRENCY_SYMBOL}${Number(option.price).toFixed(2)})`
                    : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isAddedToCart ? (
        <Link href="/cart" className="w-full block">
          <Button
            className="w-full h-8 text-[10px] sm:h-10 sm:text-sm"
            variant="outline"
            rounded="full"
          >
            View Cart
          </Button>
        </Link>
      ) : (
        <Button
          className="w-full h-8 text-[10px] sm:h-10 sm:text-sm"
          rounded="full"
          onClick={hasConfigurations ? onChooseOptions : onAddToCart}
          disabled={outOfStock}
          data-testid={`product-button-${product._id}`}
          data-has-configurations={hasConfigurations}
        >
          {outOfStock
            ? 'Out of Stock'
            : hasConfigurations
              ? 'View Product'
              : 'Add to Cart'}
        </Button>
      )}
    </div>
  );
}
