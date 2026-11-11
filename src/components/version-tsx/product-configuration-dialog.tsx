'use client';

import { CURRENCY_SYMBOL } from '@/lib/brand';
import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ProductConfigurations from '@/components/version-tsx/product-details/product-configurations';
import {
  add_cart_product,
  initialOrderQuantity,
  update_product_option,
} from '@/redux/features/cartSlice';
import { notifyError } from '@/utils/toast';
import { getProductImageUrl } from '@/lib/product-image';
import { isOutOfStock, getConfigOptionAvailableQuantity } from '@/lib/product-stock';
import { getConfigurationOverridePrice } from '@/lib/configuration-price';
import { useLazyGetProductQuery } from '@/redux/features/productApi';
import type { Product } from '@/components/version-tsx/product-card';

interface ProductConfigurationDialogProps {
  product: Product & {
    productConfigurations?: Array<{
      title: string;
      options: Array<{
        name: string;
        price: number;
        priceType?: 'fixed' | 'percentage';
        percentage?: number;
        isPercentageIncrease?: boolean;
        isSelected: boolean;
        image?: string;
      }>;
      enableCustomNote?: boolean;
      customNotePlaceholder?: string;
      customNoteValue?: string;
    }>;
    options?: Array<{
      title: string;
      price: number;
    }>;
    updatedPrice?: number;
    finalPriceDiscount?: number;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart?: (product: Product, selectedOption?: any) => void;
}

export default function ProductConfigurationDialog({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: ProductConfigurationDialogProps) {
  const dispatch = useDispatch();
  const { cart_products, orderQuantity } = useSelector((state: any) => state.cart);
  const [fetchProduct] = useLazyGetProductQuery();

  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [customNotes, setCustomNotes] = useState<{
    [configIndex: number]: string;
  }>({});
  const [selectedConfigurations, setSelectedConfigurations] = useState<{
    [configIndex: number]: {
      optionIndex: number;
      option: {
        name: string;
        price: number;
        priceType?: 'fixed' | 'percentage';
        percentage?: number;
        isPercentageIncrease?: boolean;
        image?: string;
      };
    };
  }>(() => {
    // Initialize with preselected options from backend - preserve full option for pricing
    const initial: {
      [configIndex: number]: {
        optionIndex: number;
        option: {
          name: string;
          price: number;
          priceType?: 'fixed' | 'percentage';
          percentage?: number;
          isPercentageIncrease?: boolean;
          image?: string;
        };
      };
    } = {};
    if (product.productConfigurations && product.productConfigurations.length > 0) {
      product.productConfigurations.forEach((config, configIndex) => {
        if (config.options && config.options.length > 0) {
          const preselectedIndex = config.options.findIndex(
            opt => opt.isSelected
          );
          if (preselectedIndex !== -1) {
            const opt = config.options[preselectedIndex] as {
              name: string;
              price: number;
              priceType?: 'fixed' | 'percentage';
              percentage?: number;
              isPercentageIncrease?: boolean;
              image?: string;
            };
            initial[configIndex] = {
              optionIndex: preselectedIndex,
              option: {
                name: opt.name,
                price: opt.price,
                priceType: opt.priceType,
                percentage: opt.percentage,
                isPercentageIncrease: opt.isPercentageIncrease,
                image: opt.image,
              },
            };
          }
        }
      });
    }
    return initial;
  });

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Reset to default selections when dialog closes - preserve full option for pricing
      const initial: {
        [configIndex: number]: {
          optionIndex: number;
          option: {
            name: string;
            price: number;
            priceType?: 'fixed' | 'percentage';
            percentage?: number;
            isPercentageIncrease?: boolean;
            image?: string;
          };
        };
      } = {};
      if (product.productConfigurations && product.productConfigurations.length > 0) {
        product.productConfigurations.forEach((config, configIndex) => {
          if (config.options && config.options.length > 0) {
            const preselectedIndex = config.options.findIndex(
              opt => opt.isSelected
            );
            if (preselectedIndex !== -1) {
              const opt = config.options[preselectedIndex] as {
                name: string;
                price: number;
                priceType?: 'fixed' | 'percentage';
                percentage?: number;
                isPercentageIncrease?: boolean;
                image?: string;
              };
              initial[configIndex] = {
                optionIndex: preselectedIndex,
                option: {
                  name: opt.name,
                  price: opt.price,
                  priceType: opt.priceType,
                  percentage: opt.percentage,
                  isPercentageIncrease: opt.isPercentageIncrease,
                  image: opt.image,
                },
              };
            }
          }
        });
      }
      setSelectedConfigurations(initial);
      setSelectedOption(null);
      setCustomNotes({});
    }
  }, [open, product.productConfigurations]);

  // Handle configuration change - preserve full option (priceType, percentage, isPercentageIncrease) for pricing
  const handleConfigurationChange = useCallback(
    (
      configIndex: number,
      optionIndex: number,
      option: {
        name: string;
        price: number;
        priceType?: 'fixed' | 'percentage';
        percentage?: number;
        isPercentageIncrease?: boolean;
        image?: string;
      }
    ) => {
      setSelectedConfigurations(prev => ({
        ...prev,
        [configIndex]: {
          optionIndex,
          option: { ...option },
        },
      }));
    },
    []
  );

  // Get sum of all selected configuration option prices (for fixed prices)
  // Also calculate percentage adjustments. If a configuration price override
  // rule matches, use the override price instead of the sum.
  const getSelectedConfigurationPrice = useCallback(() => {
    if (!product.productConfigurations || product.productConfigurations.length === 0) {
      return { fixedPrice: 0, percentageAdjustments: [] };
    }

    const selectedConfigEntries = Object.values(selectedConfigurations);
    if (selectedConfigEntries.length === 0) {
      return { fixedPrice: 0, percentageAdjustments: [] };
    }

    // Check for configuration price override (e.g. both "Yes" → $50)
    const overridePrice = getConfigurationOverridePrice(product, selectedConfigurations);
    if (overridePrice != null) {
      return { fixedPrice: overridePrice, percentageAdjustments: [] };
    }

    let fixedPrice = 0;
    const percentageAdjustments = [];

    // Process all selected options
    for (const { option } of selectedConfigEntries) {
      if (option) {
        if (option.priceType === 'percentage') {
          // Store percentage adjustment for later calculation
          percentageAdjustments.push({
            percentage: option.percentage || 0,
            isIncrease: option.isPercentageIncrease !== false,
          });
        } else {
          // Fixed price - add to sum
          if (option.price !== undefined && option.price !== null) {
            const configPrice = Number(option.price);
            if (configPrice > 0) {
              fixedPrice += configPrice;
            }
          }
        }
      }
    }

    return { fixedPrice, percentageAdjustments };
  }, [product, selectedConfigurations]);

  // Calculate price with percentage adjustments
  const applyPercentageAdjustments = useCallback((basePrice: number, percentageAdjustments: Array<{ percentage: number; isIncrease: boolean }>) => {
    let adjustedPrice = basePrice;

    percentageAdjustments.forEach((adjustment) => {
      const percentage = adjustment.percentage || 0;
      if (adjustment.isIncrease) {
        adjustedPrice = adjustedPrice * (1 + percentage / 100);
      } else {
        adjustedPrice = adjustedPrice * (1 - percentage / 100);
      }
    });

    return adjustedPrice;
  }, []);

  const calculateFinalPrice = useCallback(() => {
    const productFinal = Number(product.finalPriceDiscount ?? 0);
    const productMarked = Number((product as { displayMarkedPrice?: number }).displayMarkedPrice ?? product.finalPriceDiscount ?? 0);
    const hasDiscount = (product as { hasDisplayDiscount?: boolean }).hasDisplayDiscount ?? false;

    let basePrice = productFinal;

    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
      // Apply stored product discount ratio to config price when MRP is above final price.
      if (hasDiscount && productMarked > 0) {
        const discountRatio = productFinal / productMarked;
        basePrice = configFixedPrice * discountRatio;
      }
    }

    const adjustedPrice = applyPercentageAdjustments(basePrice, percentageAdjustments);
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = adjustedPrice + optionPrice;

    return finalPrice.toFixed(2);
  }, [getSelectedConfigurationPrice, applyPercentageAdjustments, selectedOption, product.finalPriceDiscount, product]);

  const calculateMarkedUpPrice = useCallback(() => {
    const productMarked = Number((product as { displayMarkedPrice?: number }).displayMarkedPrice ?? product.finalPriceDiscount ?? 0);
    let basePrice = productMarked;

    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
    }

    const adjustedPrice = applyPercentageAdjustments(Number(basePrice), percentageAdjustments);
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    return (adjustedPrice + optionPrice).toFixed(2);
  }, [getSelectedConfigurationPrice, applyPercentageAdjustments, selectedOption, product.finalPriceDiscount, product]);

  const hasProductDiscount = (product as { hasDisplayDiscount?: boolean }).hasDisplayDiscount ?? false;
  const showMarkedPrice = hasProductDiscount;

  // Helper function to compare configurations
  const configurationsChanged = useCallback(
    (existingConfigs: any, currentConfigs: any) => {
      if (!existingConfigs && !currentConfigs) return false;
      if (!existingConfigs || !currentConfigs) return true;

      const normalizeConfig = (configs: any) => {
        if (!configs) return {};
        return Object.keys(configs).reduce((acc: any, key: string) => {
          const config = configs[key];
          if (config && config.option) {
            acc[key] = {
              optionIndex: config.optionIndex,
              optionName: config.option?.name,
              optionPrice: config.option?.price,
            };
          }
          return acc;
        }, {});
      };

      const normalizedExisting = normalizeConfig(existingConfigs);
      const normalizedCurrent = normalizeConfig(currentConfigs);

      return JSON.stringify(normalizedExisting) !== JSON.stringify(normalizedCurrent);
    },
    []
  );

  // Handle add to cart
  const handleAddToCartClick = useCallback(async () => {
    // Check if product has options but none are selected
    if (product.options && product.options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    // Re-fetch product to validate stock (handles stale page when another user bought last item)
    let freshProduct: typeof product;
    try {
      const result = await fetchProduct(product._id);
      if (result.error || !result.data) {
        notifyError('Unable to verify product availability. Please try again.');
        return;
      }
      freshProduct = result.data as typeof product;
      if (isOutOfStock(freshProduct)) {
        notifyError('This product is out of stock.');
        return;
      }
    } catch {
      notifyError('Unable to verify product availability. Please try again.');
      return;
    }

    // Use fresh quantity for validation (product-level or config option-level)
    const configOptionQty = getConfigOptionAvailableQuantity(freshProduct, selectedConfigurations);
    const productWithFreshQuantity = {
      ...product,
      quantity: configOptionQty != null ? configOptionQty : Number(freshProduct?.quantity ?? 0),
    };

    // Validate selected config options are not out of stock
    if (configOptionQty != null) {
      if (configOptionQty <= 0) {
        notifyError('The selected option is out of stock.');
        return;
      }
    }

    // Check if product already exists in cart (any item with same _id - we may be replacing it)
    const existingProduct = cart_products.find(
      (item: any) => item._id === product._id
    );

    // Check if option has changed
    const optionChanged =
      existingProduct &&
      JSON.stringify(existingProduct.selectedOption) !==
      JSON.stringify(selectedOption);

    // Check if configuration has changed
    const configurationChanged =
      existingProduct &&
      configurationsChanged(
        existingProduct.selectedConfigurations,
        selectedConfigurations
      );

    const productChanged = optionChanged || configurationChanged;
    const currentQty = existingProduct ? existingProduct.orderQuantity : 0;

    // Determine final quantity
    let finalQuantity;
    if (configurationChanged) {
      finalQuantity = orderQuantity;
    } else if (optionChanged) {
      finalQuantity = currentQty;
    } else {
      finalQuantity = currentQty + orderQuantity;
    }

    // Check quantity limits (use fresh quantity from refetch)
    if (productWithFreshQuantity.quantity && finalQuantity > productWithFreshQuantity.quantity) {
      notifyError(
        `Sorry, only ${productWithFreshQuantity.quantity} items available. ${existingProduct ? `You already have ${currentQty} in your cart.` : ''
        }`
      );
      return;
    }

    // If option or configuration changed, remove the existing cart item first
    if (productChanged && existingProduct) {
      dispatch(
        update_product_option({
          id: existingProduct._id,
          selectedOption: existingProduct.selectedOption,
          selectedConfigurations: existingProduct.selectedConfigurations,
          customNotes: existingProduct.customNotes,
        })
      );
    }

    const markedUpPrice = Number((product as { displayMarkedPrice?: number }).displayMarkedPrice ?? product.finalPriceDiscount ?? 0);
    const hasDiscount = (product as { hasDisplayDiscount?: boolean }).hasDisplayDiscount ?? false;

    let basePrice = Number(product.finalPriceDiscount ?? 0);

    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
      // Apply stored product discount ratio to config price when MRP is above final price.
      if (hasDiscount && markedUpPrice > 0) {
        const discountRatio = Number(product.finalPriceDiscount ?? 0) / markedUpPrice;
        basePrice = configFixedPrice * discountRatio;
      }
    }

    const adjustedPrice = applyPercentageAdjustments(basePrice, percentageAdjustments);

    // THEN add product option price to the already discounted and adjusted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = adjustedPrice + optionPrice;

    // basePrice = marked price (for discount badge). When config: marked = configFixedPrice + optionPrice before discount
    const basePriceForCart =
      configFixedPrice > 0
        ? applyPercentageAdjustments(configFixedPrice, percentageAdjustments) + optionPrice
        : markedUpPrice + optionPrice;

    // Determine the product image to use (option image if available, otherwise original)
    let productImage = getProductImageUrl(product);
    if (selectedConfigurations && Object.keys(selectedConfigurations).length > 0) {
      // Find the first selected option with an image (prioritize last selected)
      const configIndices = Object.keys(selectedConfigurations);
      for (let i = configIndices.length - 1; i >= 0; i--) {
        const configIndex = parseInt(configIndices[i]);
        const selectedConfig = selectedConfigurations[configIndex];
        const opt = selectedConfig?.option;
        const optImg = opt?.image || (opt as any)?.imageWithMeta?.url;
        if (selectedConfig && opt && optImg) {
          productImage = optImg;
          break;
        }
      }
    }

    // Create properly formatted productConfigurations array
    let updatedProductConfigurations = undefined;
    if (product.productConfigurations && product.productConfigurations.length > 0) {
      updatedProductConfigurations = product.productConfigurations.map(
        (config: any, configIndex: number) => {
          // If custom note is enabled, include the custom note value in the config
          if (config.enableCustomNote) {
            const customNoteValue = customNotes && customNotes[configIndex] && typeof customNotes[configIndex] === 'string' && customNotes[configIndex].trim() !== ''
              ? customNotes[configIndex].trim()
              : undefined;

            return {
              ...config,
              ...(customNoteValue && { customNoteValue }),
            };
          }
          // Otherwise, handle selected configurations
          const selectedConfig = selectedConfigurations[configIndex];
          if (selectedConfig) {
            return {
              ...config,
              options: config.options.map((option: any, optionIndex: number) => {
                const isSelected = optionIndex === selectedConfig.optionIndex;
                // Preserve all option properties including priceType, percentage, isPercentageIncrease, and image
                return {
                  ...option,
                  // Set isSelected to true only for the user-selected option
                  isSelected,
                  // Preserve the selected option's image, priceType, percentage, and isPercentageIncrease if they exist
                  ...(isSelected && selectedConfig.option && {
                    ...(selectedConfig.option.image && { image: selectedConfig.option.image }),
                    ...(selectedConfig.option.priceType && { priceType: selectedConfig.option.priceType }),
                    ...(selectedConfig.option.percentage !== undefined && { percentage: selectedConfig.option.percentage }),
                    ...(selectedConfig.option.isPercentageIncrease !== undefined && { isPercentageIncrease: selectedConfig.option.isPercentageIncrease }),
                  }),
                };
              }),
            };
          }
          return config;
        }
      );
    }

    const computedCustomNotes = (() => {
      // Check if there are any configurations with enableCustomNote
      const hasCustomNoteConfigs = product.productConfigurations && product.productConfigurations.some((config: any) => config.enableCustomNote);
      if (!hasCustomNoteConfigs) return undefined;

      // If no customNotes object, return undefined
      if (!customNotes || typeof customNotes !== 'object' || Array.isArray(customNotes)) {
        return undefined;
      }

      // Filter and trim all non-empty values
      const filteredNotes: { [key: number]: string } = {};
      for (const key in customNotes) {
        if (Object.prototype.hasOwnProperty.call(customNotes, key)) {
          const note = customNotes[key];
          // Check if note is a non-empty string
          if (note !== null && note !== undefined && typeof note === 'string' && note.trim() !== '') {
            filteredNotes[Number(key)] = note.trim();
          }
        }
      }

      // Return filtered notes only if there are any non-empty values
      return Object.keys(filteredNotes).length > 0 ? filteredNotes : undefined;
    })();

    const productToAdd = {
      ...product,
      sku: product.sku ?? product._id ?? '',
      // Update product image if option image is selected
      img: productImage || getProductImageUrl(product) || '',
      finalPriceDiscount: finalPrice,
      updatedPrice: markedUpPrice,
      selectedOption,
      basePrice: basePriceForCart,
      orderQuantity: orderQuantity,
      productConfigurations:
        updatedProductConfigurations || product.productConfigurations,
      selectedConfigurations:
        Object.keys(selectedConfigurations).length > 0
          ? selectedConfigurations
          : undefined,
      customNotes: computedCustomNotes,
      options: selectedOption ? [selectedOption] : [],
    };

    dispatch(add_cart_product(productToAdd));

    if (productChanged) {
      dispatch(initialOrderQuantity());
    }

    // Close dialog
    onOpenChange(false);
  }, [
    product,
    fetchProduct,
    selectedOption,
    selectedConfigurations,
    cart_products,
    orderQuantity,
    getSelectedConfigurationPrice,
    configurationsChanged,
    customNotes,
    dispatch,
    onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {product.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Configurations */}
          {product.productConfigurations &&
            product.productConfigurations.length > 0 && (
              <div className="space-y-6">
                {/* Render configurations with options (when custom note is disabled) */}
                <ProductConfigurations
                  configurations={product.productConfigurations}
                  onConfigurationChange={handleConfigurationChange}
                />
                {/* Custom Note Fields (when custom note is enabled) */}
                {product.productConfigurations.map((config: any, configIndex: number) => {
                  if (!config.enableCustomNote) return null;
                  return (
                    <div key={`custom-note-${configIndex}`} className="space-y-2">
                      <Label htmlFor={`custom-note-${configIndex}`} className="text-sm font-medium">
                        {config.title}
                      </Label>
                      <Textarea
                        id={`custom-note-${configIndex}`}
                        placeholder={config.customNotePlaceholder || 'Specify Rod Ends preference (All left, All right, mixed, or custom).'}
                        value={customNotes[configIndex] || ''}
                        onChange={(e) =>
                          setCustomNotes((prev) => ({
                            ...prev,
                            [configIndex]: e.target.value,
                          }))
                        }
                        className="min-h-[100px] resize-y"
                        rows={3}
                      />
                    </div>
                  );
                })}
              </div>
            )}

          {/* Product Options (if any) */}
          {product.options && product.options.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-foreground">
                Product Options
              </h3>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                value={
                  selectedOption
                    ? product.options.indexOf(selectedOption).toString()
                    : ''
                }
                onChange={e => {
                  const optionIndex = e.target.value;
                  if (optionIndex === '') {
                    setSelectedOption(null);
                  } else if (product.options && product.options.length > 0) {
                    setSelectedOption(product.options[parseInt(optionIndex)]);
                  }
                }}
              >
                <option value="">Select an option...</option>
                {product.options.map((option, index) => (
                  <option key={index} value={index.toString()}>
                    {option.title}
                    {option.price && Number(option.price) !== 0
                      ? ` (+${CURRENCY_SYMBOL}${Number(option.price).toFixed(2)})`
                      : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Separator />

          {/* Price Display - finalPriceDiscount is single source of truth */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <div className="flex items-center gap-2 mt-1">
                {showMarkedPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {CURRENCY_SYMBOL}{calculateMarkedUpPrice()}
                  </span>
                )}
                <span className="text-2xl font-bold text-primary">
                  {CURRENCY_SYMBOL}{calculateFinalPrice()}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleAddToCartClick}
            disabled={isOutOfStock(product)}
          >
            {isOutOfStock(product)
              ? 'Out of Stock'
              : 'Add to Cart'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
