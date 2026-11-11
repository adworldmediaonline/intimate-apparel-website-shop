'use client';
import { CURRENCY_SYMBOL } from '@/lib/brand';
import { getProductImageUrl, getProductImageUrls } from '@/lib/product-image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/authClient';
import { replaceTextCharacters } from '@/lib/replaceTextCharacters';
import {
  add_cart_product,
  increment,
  initialOrderQuantity,
  update_product_option,
} from '@/redux/features/cartSlice';
import { add_to_compare } from '@/redux/features/compareSlice';
import { add_to_wishlist } from '@/redux/features/wishlist-slice';
import { notifyError, notifySuccess } from '@/utils/toast';
import { getProductDisplayPrices, resolveCartItemPrice } from '@/lib/product-price';
import { getConfigurationOverridePrice } from '@/lib/configuration-price';
import { isOutOfStock, getConfigOptionAvailableQuantity } from '@/lib/product-stock';
import { useLazyGetProductQuery } from '@/redux/features/productApi';
import { getCartItemId } from '@/lib/cart-item-id';
import {
  BarChart3,
  CheckCircle,
  FileText,
  Heart,
  HelpCircle,
  MessageSquare,
  Package,
  Plus,
  ShoppingCart,
  Star,
  Tag,
  Truck,
  XCircle,
  Zap,
  Share2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProductDetailsCountdown from './product-details-countdown';
import ProductQuantity from './product-quantity';
import ReviewForm from './review-form';
import ReviewItem from './review-item';
import ProductConfigurations from './product-configurations';
import { getProductPagePromo } from './product-page-promos';

// Custom Rating Component
const ProductRating = ({ rating, reviewCount }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
      <div className="flex items-center gap-1">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            className="w-5 h-5 text-[var(--wf-sale)] fill-current"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative w-5 h-5">
            <Star className="w-5 h-5 text-[var(--wf-sale)] fill-current" />
            <div
              className="absolute inset-0 bg-background"
              style={{ clipPath: 'inset(0 50% 0 0)' }}
            >
              <Star className="w-5 h-5 text-[var(--wf-sale)]" />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            className="w-5 h-5 text-muted-foreground/30"
          />
        ))}
      </div>

      {reviewCount > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount} Review{reviewCount !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};

export default function DetailsWrapper({
  productItem,
  handleImageActive,
  activeImg,
  onSelectedOptionGalleryChange,
  onAddToCartRef,
  onProceedToBuyRef,
}) {
  const {
    sku,
    title,
    category,
    price,
    reviews,
    tags,
    offerDate,
    options,
    productConfigurations,
    updatedPrice,
    finalPriceDiscount,
    description,
    faqs,
  } = productItem || {};
  const outOfStock = isOutOfStock(productItem);
  const productPromo = getProductPagePromo(productItem);
  const img = getProductImageUrl(productItem || {});
  const imageURLs = getProductImageUrls(productItem || {});
  const [selectedOption, setSelectedOption] = useState(null);
  const [customNotes, setCustomNotes] = useState({});

  // Product is pre-enriched in getProductSingle from stored pricing fields.

  // Initialize selectedConfigurations with preselected options from backend
  const [selectedConfigurations, setSelectedConfigurations] = useState(() => {
    const initial = {};
    if (productConfigurations && productConfigurations.length > 0) {
      productConfigurations.forEach((config, configIndex) => {
        if (config.options && config.options.length > 0) {
          const preselectedIndex = config.options.findIndex(
            opt => opt.isSelected
          );
          if (preselectedIndex !== -1) {
            initial[configIndex] = {
              optionIndex: preselectedIndex,
              option: config.options[preselectedIndex],
            };
          }
        }
      });
    }
    return initial;
  });

  // Update main product image when option with image is selected (preselected or manually)
  // Only run when selectedConfigurations or productConfigurations change - NOT on every render.
  // Including imageURLs/img in deps causes the effect to run on every render (new array ref),
  // which overwrites thumbnail clicks. Use selectedConfigurations as the trigger only.
  useEffect(() => {
    if (!productConfigurations || productConfigurations.length === 0) return;
    if (!handleImageActive) return;

    // Check all selected configurations for images
    let optionImage = null;
    let optionGallery = [];
    let optionGalleryLabel = '';
    const configIndices = Object.keys(selectedConfigurations);

    // Find the most recently selected option with a single swap-image and/or a gallery.
    for (let i = configIndices.length - 1; i >= 0; i--) {
      const configIndex = parseInt(configIndices[i]);
      const selectedConfig = selectedConfigurations[configIndex];
      const option = selectedConfig && selectedConfig.option;
      if (!option) continue;

      if (!optionImage && option.image) {
        optionImage = option.image; // most recently selected option's main swap image
      }
      if (
        optionGallery.length === 0 &&
        Array.isArray(option.imageURLsWithMeta) &&
        option.imageURLsWithMeta.length > 0
      ) {
        optionGallery = option.imageURLsWithMeta;
        optionGalleryLabel = option.name || '';
      }
      if (optionImage && optionGallery.length > 0) break;
    }

    // Update the main product image
    // If an option image is found, use it; otherwise, revert to original product image
    if (optionImage) {
      handleImageActive(optionImage);
    } else if (imageURLs && imageURLs.length > 0) {
      // Revert to first product image if no option image is selected
      handleImageActive(imageURLs[0] || img);
    } else if (img) {
      // Fallback to main product image
      handleImageActive(img);
    }

    // Emit the selected option's gallery so the left column can render the carousel.
    if (onSelectedOptionGalleryChange) {
      onSelectedOptionGalleryChange(optionGallery, optionGalleryLabel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- imageURLs/img excluded: they create new refs each render and would overwrite thumbnail clicks
  }, [selectedConfigurations, productConfigurations, handleImageActive, onSelectedOptionGalleryChange]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isReviewsPopoverOpen, setIsReviewsPopoverOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { orderQuantity, cart_products } = useSelector(state => state.cart);
  const [fetchProduct] = useLazyGetProductQuery();

  // Calculate average rating (derived state - no memoization needed for simple calculation)
  const ratingVal = reviews?.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  // Opens for everyone. The missing-session `return` this replaced did
  // nothing at all on click — no dialog, no prompt — which is what made
  // Write a Review look broken for signed-out visitors.
  const handleReviewButtonClick = () => {
    setIsReviewDialogOpen(true);
  };

  // Get sum of all selected configuration option prices (for fixed prices)
  // Also calculate percentage adjustments. If a configuration price override
  // rule matches, use the override price instead of the sum.
  const getSelectedConfigurationPrice = () => {
    if (!productConfigurations || productConfigurations.length === 0) {
      return { fixedPrice: 0, percentageAdjustments: [] };
    }

    // Check if any configuration has a selected option
    const selectedConfigEntries = Object.values(selectedConfigurations);
    if (selectedConfigEntries.length === 0) {
      return { fixedPrice: 0, percentageAdjustments: [] };
    }

    // Check for configuration price override (e.g. both "Yes" → $50)
    const overridePrice = getConfigurationOverridePrice(productItem, selectedConfigurations);
    if (overridePrice != null) {
      return { fixedPrice: overridePrice, percentageAdjustments: [] };
    }

    let fixedPrice = 0;
    const percentageAdjustments = [];

    // Process all selected options
    selectedConfigEntries.forEach((selectedConfig) => {
      if (selectedConfig && selectedConfig.option) {
        const option = selectedConfig.option;

        if (option.priceType === 'percentage') {
          // Store percentage adjustment for later calculation
          percentageAdjustments.push({
            percentage: option.percentage || 0,
            isIncrease: option.isPercentageIncrease !== false,
          });
        } else {
          // Fixed price - add to sum
          fixedPrice += Number(option.price || 0);
        }
      }
    });

    return { fixedPrice, percentageAdjustments };
  };

  // Calculate price with percentage adjustments
  const applyPercentageAdjustments = (basePrice, percentageAdjustments) => {
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
  };

  // finalPriceDiscount is single source of truth. Marked = original base. Final = after discounts.
  const calculateFinalPrice = () => {
    const productFinal = Number(finalPriceDiscount ?? 0);
    const productMarked = Number(productItem?.displayMarkedPrice ?? finalPriceDiscount ?? 0);
    const hasDiscount = productItem?.hasDisplayDiscount ?? false;

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
    return (adjustedPrice + optionPrice).toFixed(2);
  };

  const calculateMarkedUpPrice = () => {
    const productMarked = Number(productItem?.displayMarkedPrice ?? finalPriceDiscount ?? 0);
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
  };

  const hasProductDiscount = productItem?.hasDisplayDiscount ?? false;
  const showMarkedPrice = hasProductDiscount;

  // Handle option selection
  const handleOptionChange = e => {
    const optionIndex = e.target.value;
    if (optionIndex === '') {
      setSelectedOption(null);
    } else {
      setSelectedOption(options[parseInt(optionIndex)]);
    }
  };

  // Helper function to compare configurations
  const configurationsChanged = (existingConfigs, currentConfigs) => {
    if (!existingConfigs && !currentConfigs) return false;
    if (!existingConfigs || !currentConfigs) return true;

    // Normalize both configurations for comparison
    const normalizeConfig = (configs) => {
      if (!configs) return {};
      return Object.keys(configs).reduce((acc, key) => {
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
  };

  // handle add product
  const handleAddProduct = async prd => {
    // Check if product has options but none are selected
    if (options && options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before adding the product to your cart.'
      );
      return;
    }

    // Re-fetch product to validate stock (handles stale page when another user bought last item)
    try {
      const result = await fetchProduct(prd._id);
      if (result.error || !result.data) {
        notifyError('Unable to verify product availability. Please try again.');
        return;
      }
      const freshProduct = result.data;
      if (isOutOfStock(freshProduct)) {
        notifyError('This product is out of stock.');
        return;
      }
      const configOptionQty = getConfigOptionAvailableQuantity(freshProduct, selectedConfigurations);
      const availableQty = configOptionQty != null ? configOptionQty : Number(freshProduct?.quantity ?? 0);
      if (configOptionQty != null && configOptionQty <= 0) {
        notifyError('The selected option is out of stock.');
        return;
      }
      prd = { ...prd, quantity: availableQty };
    } catch {
      notifyError('Unable to verify product availability. Please try again.');
      return;
    }

    const newItemIdentity = {
      _id: prd._id,
      selectedOption,
      selectedConfigurations,
      customNotes,
    };

    // Find existing by full identity (same config) - for merging
    const existingProduct = cart_products.find(
      item => getCartItemId(item) === getCartItemId(newItemIdentity)
    );

    // Find any existing with same _id (for replacement when config changed)
    const existingWithSameId = cart_products.find(item => item._id === prd._id);

    // If product exists with same _id but different config, we need to replace it
    const optionChanged =
      existingWithSameId &&
      JSON.stringify(existingWithSameId.selectedOption) !==
      JSON.stringify(selectedOption);

    const configurationChanged =
      existingWithSameId &&
      configurationsChanged(
        existingWithSameId.selectedConfigurations,
        selectedConfigurations
      );

    const productChanged = optionChanged || configurationChanged;

    const currentQty = existingProduct ? existingProduct.orderQuantity : (existingWithSameId ? existingWithSameId.orderQuantity : 0);

    // Determine final quantity:
    // - If configuration changed: RESET to current orderQuantity (fresh start)
    // - If only option changed: Keep existing quantity (update option only)
    // - If nothing changed: Add orderQuantity to existing quantity
    let finalQuantity;
    if (configurationChanged) {
      // Configuration changed: Reset quantity to current selector value
      finalQuantity = orderQuantity;
    } else if (optionChanged) {
      // Only option changed: Keep existing quantity
      finalQuantity = currentQty;
    } else {
      // Nothing changed: Add to existing quantity
      finalQuantity = currentQty + orderQuantity;
    }

    // If product has quantity limitation and requested quantity exceeds available
    if (prd.quantity && finalQuantity > prd.quantity) {
      notifyError(
        `Sorry, only ${prd.quantity} items available. ${existingProduct ? `You already have ${currentQty} in your cart.` : ''
        }`
      );
      return;
    }

    // If option or configuration changed, remove the existing cart item first
    if (productChanged && existingWithSameId) {
      dispatch(
        update_product_option({
          id: existingWithSameId._id,
          selectedOption: existingWithSameId.selectedOption,
          selectedConfigurations: existingWithSameId.selectedConfigurations,
          customNotes: existingWithSameId.customNotes,
        })
      );

      // Reset order quantity based on what changed
      if (configurationChanged) {
        // Configuration changed: Reset to current orderQuantity (already set above)
      } else {
        // Only option changed: Keep existing quantity
        dispatch(initialOrderQuantity());
        for (let i = 1; i < currentQty; i++) {
          dispatch(increment());
        }
      }
    }
    //
    // SIMPLE PRICE CALCULATION - Always start fresh from original product price
    const markedUpPrice = Number(prd.displayMarkedPrice ?? prd.finalPriceDiscount ?? 0);
    const hasDiscount = prd.hasDisplayDiscount ?? false;

    // Step 1: Determine base price - sum all selected configuration option prices
    let basePrice = Number(prd.finalPriceDiscount ?? 0);

    // Get configuration prices and percentage adjustments
    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    // If configuration has fixed price, use it instead of base price
    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
      // Apply stored product discount ratio to config price when MRP is above final price.
      if (hasDiscount && markedUpPrice > 0) {
        const discountRatio = Number(prd.finalPriceDiscount ?? 0) / markedUpPrice;
        basePrice = configFixedPrice * discountRatio;
      }
    }

    // Product is pre-enriched from stored pricing fields.
    const adjustedPrice = applyPercentageAdjustments(basePrice, percentageAdjustments);

    // Step 4: THEN add product option price to the already discounted and adjusted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = adjustedPrice + optionPrice;

    // basePriceForCart = marked price (for discount badge). When config: marked = configFixedPrice + optionPrice before discount
    const basePriceForCart =
      configFixedPrice > 0
        ? applyPercentageAdjustments(configFixedPrice, percentageAdjustments) + optionPrice
        : markedUpPrice + optionPrice;

    // Determine the product image to use (option image if available, otherwise original)
    let productImage = prd.img;
    if (selectedConfigurations && Object.keys(selectedConfigurations).length > 0) {
      // Find the first selected option with an image (prioritize last selected)
      const configIndices = Object.keys(selectedConfigurations);
      for (let i = configIndices.length - 1; i >= 0; i--) {
        const configIndex = parseInt(configIndices[i]);
        const selectedConfig = selectedConfigurations[configIndex];
        if (selectedConfig && selectedConfig.option && selectedConfig.option.image) {
          productImage = selectedConfig.option.image;
          break;
        }
      }
    }

    // Create properly formatted productConfigurations array with correct isSelected flags
    let updatedProductConfigurations = undefined;
    if (productConfigurations && productConfigurations.length > 0) {
      updatedProductConfigurations = productConfigurations.map((config, configIndex) => {
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

        // If this configuration has a user selection, update isSelected flags
        if (selectedConfig) {
          return {
            ...config,
            options: config.options.map((option, optionIndex) => {
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

        // If no user selection for this config, keep original (preselected) state
        return config;
      });
    }

    const computedCustomNotes = (() => {
      // Check if there are any configurations with enableCustomNote
      const hasCustomNoteConfigs = productConfigurations && productConfigurations.some(config => config.enableCustomNote);
      if (!hasCustomNoteConfigs) return undefined;

      // If no customNotes object, return undefined
      if (!customNotes || typeof customNotes !== 'object' || Array.isArray(customNotes)) {
        return undefined;
      }

      // Filter and trim all non-empty values
      const filteredNotes = {};
      for (const key in customNotes) {
        if (Object.prototype.hasOwnProperty.call(customNotes, key)) {
          const note = customNotes[key];
          // Check if note is a non-empty string
          if (note !== null && note !== undefined && typeof note === 'string' && note.trim() !== '') {
            filteredNotes[key] = note.trim();
          }
        }
      }

      // Return filtered notes only if there are any non-empty values
      return Object.keys(filteredNotes).length > 0 ? filteredNotes : undefined;
    })();

    const productToAdd = {
      ...prd,
      // Update product image if option image is selected
      img: productImage,
      // Always set price from scratch - never use existing prd.finalPriceDiscount
      // Price uses stored final price plus selected configuration/options.
      finalPriceDiscount: finalPrice,
      updatedPrice: markedUpPrice,
      selectedOption,
      basePrice: basePriceForCart, // Store marked price for discount badge
      // Replace productConfigurations with updated version that has correct isSelected flags
      productConfigurations: updatedProductConfigurations || prd.productConfigurations,
      selectedConfigurations: Object.keys(selectedConfigurations).length > 0
        ? selectedConfigurations
        : undefined,
      customNotes: computedCustomNotes,
      options: selectedOption ? [selectedOption] : [],
    };

    dispatch(add_cart_product(productToAdd));

    // Cart confirmation modal will handle user feedback - no toast needed

    // Reset the order quantity back to 1 for future additions
    if (productChanged) {
      dispatch(initialOrderQuantity());
    }
  };

  // handle wishlist product
  const handleWishlistProduct = prd => {
    dispatch(add_to_wishlist(prd));
  };

  // handle compare product
  const handleCompareProduct = prd => {
    dispatch(add_to_compare(prd));
  };

  // handle proceed to buy - adds to cart and navigates to checkout
  const handleProceedToBuy = prd => {
    // First add to cart using the same logic as handleAddProduct
    if (options && options.length > 0 && !selectedOption) {
      notifyError(
        'Please select an option before proceeding to checkout.'
      );
      return;
    }

    const newItemIdentity = {
      _id: prd._id,
      selectedOption,
      selectedConfigurations,
      customNotes,
    };

    const existingProduct = cart_products.find(
      item => getCartItemId(item) === getCartItemId(newItemIdentity)
    );
    const existingWithSameId = cart_products.find(item => item._id === prd._id);

    const optionChanged =
      existingWithSameId &&
      JSON.stringify(existingWithSameId.selectedOption) !==
      JSON.stringify(selectedOption);

    const configurationChanged =
      existingWithSameId &&
      configurationsChanged(
        existingWithSameId.selectedConfigurations,
        selectedConfigurations
      );

    const productChanged = optionChanged || configurationChanged;

    const currentQty = existingProduct ? existingProduct.orderQuantity : (existingWithSameId ? existingWithSameId.orderQuantity : 0);

    // Determine final quantity:
    // - If configuration changed: RESET to current orderQuantity (fresh start)
    // - If only option changed: Keep existing quantity (update option only)
    // - If nothing changed: Add orderQuantity to existing quantity
    let finalQuantity;
    if (configurationChanged) {
      // Configuration changed: Reset quantity to current selector value
      finalQuantity = orderQuantity;
    } else if (optionChanged) {
      // Only option changed: Keep existing quantity
      finalQuantity = currentQty;
    } else {
      // Nothing changed: Add to existing quantity
      finalQuantity = currentQty + orderQuantity;
    }

    if (prd.quantity && finalQuantity > prd.quantity) {
      notifyError(
        `Sorry, only ${prd.quantity} items available. ${existingWithSameId ? `You already have ${currentQty} in your cart.` : ''
        }`
      );
      return;
    }

    if (productChanged && existingWithSameId) {
      dispatch(
        update_product_option({
          id: existingWithSameId._id,
          selectedOption: existingWithSameId.selectedOption,
          selectedConfigurations: existingWithSameId.selectedConfigurations,
          customNotes: existingWithSameId.customNotes,
        })
      );

      if (configurationChanged) {
        // Reset to current orderQuantity
      } else {
        dispatch(initialOrderQuantity());
        for (let i = 1; i < currentQty; i++) {
          dispatch(increment());
        }
      }
    }

    // SIMPLE PRICE CALCULATION - Always start fresh from original product price
    const markedUpPrice = Number(prd.displayMarkedPrice ?? prd.finalPriceDiscount ?? 0);
    const hasDiscount = prd.hasDisplayDiscount ?? false;

    // Step 1: Determine base price - sum all selected configuration option prices
    let basePrice = Number(prd.finalPriceDiscount ?? 0);

    // Get configuration prices and percentage adjustments
    const configResult = getSelectedConfigurationPrice();
    const configFixedPrice = configResult.fixedPrice || 0;
    const percentageAdjustments = configResult.percentageAdjustments || [];

    // If configuration has fixed price, use it instead of base price
    if (configFixedPrice > 0) {
      basePrice = configFixedPrice;
      // Apply stored product discount ratio to config price when MRP is above final price.
      if (hasDiscount && markedUpPrice > 0) {
        const discountRatio = Number(prd.finalPriceDiscount ?? 0) / markedUpPrice;
        basePrice = configFixedPrice * discountRatio;
      }
    }

    // Product is pre-enriched from stored pricing fields.
    const adjustedPrice = applyPercentageAdjustments(basePrice, percentageAdjustments);

    // Step 4: THEN add product option price to the already discounted and adjusted base price
    // No discount is applied to options - they're added at full price
    const optionPrice = selectedOption ? Number(selectedOption.price) : 0;
    const finalPrice = adjustedPrice + optionPrice;

    // basePriceForCart = marked price (for discount badge). When config: marked = configFixedPrice + optionPrice before discount
    const basePriceForCart =
      configFixedPrice > 0
        ? applyPercentageAdjustments(configFixedPrice, percentageAdjustments) + optionPrice
        : markedUpPrice + optionPrice;

    // Determine the product image to use (option image if available, otherwise original)
    let productImage = prd.img;
    if (selectedConfigurations && Object.keys(selectedConfigurations).length > 0) {
      // Find the first selected option with an image (prioritize last selected)
      const configIndices = Object.keys(selectedConfigurations);
      for (let i = configIndices.length - 1; i >= 0; i--) {
        const configIndex = parseInt(configIndices[i]);
        const selectedConfig = selectedConfigurations[configIndex];
        if (selectedConfig && selectedConfig.option && selectedConfig.option.image) {
          productImage = selectedConfig.option.image;
          break;
        }
      }
    }

    // Create properly formatted productConfigurations array with correct isSelected flags
    let updatedProductConfigurations = undefined;
    if (productConfigurations && productConfigurations.length > 0) {
      updatedProductConfigurations = productConfigurations.map((config, configIndex) => {
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

        // If this configuration has a user selection, update isSelected flags
        if (selectedConfig) {
          return {
            ...config,
            options: config.options.map((option, optionIndex) => {
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

        // If no user selection for this config, keep original (preselected) state
        return config;
      });
    }

    const computedCustomNotes = (() => {
      // Check if there are any configurations with enableCustomNote
      const hasCustomNoteConfigs = productConfigurations && productConfigurations.some(config => config.enableCustomNote);
      if (!hasCustomNoteConfigs) return undefined;

      // If no customNotes object, return undefined
      if (!customNotes || typeof customNotes !== 'object' || Array.isArray(customNotes)) {
        return undefined;
      }

      // Filter and trim all non-empty values
      const filteredNotes = {};
      for (const key in customNotes) {
        if (Object.prototype.hasOwnProperty.call(customNotes, key)) {
          const note = customNotes[key];
          // Check if note is a non-empty string
          if (note !== null && note !== undefined && typeof note === 'string' && note.trim() !== '') {
            filteredNotes[key] = note.trim();
          }
        }
      }

      // Return filtered notes only if there are any non-empty values
      return Object.keys(filteredNotes).length > 0 ? filteredNotes : undefined;
    })();

    const productToAdd = {
      ...prd,
      // Update product image if option image is selected
      img: productImage,
      // Always set price from scratch - never use existing prd.finalPriceDiscount
      // Price uses stored final price plus selected configuration/options.
      finalPriceDiscount: finalPrice,
      updatedPrice: markedUpPrice,
      selectedOption,
      basePrice: basePriceForCart, // Store marked price for discount badge
      // Replace productConfigurations with updated version that has correct isSelected flags
      productConfigurations: updatedProductConfigurations || prd.productConfigurations,
      selectedConfigurations: Object.keys(selectedConfigurations).length > 0
        ? selectedConfigurations
        : undefined,
      customNotes: computedCustomNotes,
      options: selectedOption ? [selectedOption] : [],
    };

    dispatch(add_cart_product(productToAdd));

    if (productChanged) {
      dispatch(initialOrderQuantity());
    }

    // Navigate to checkout
    router.push('/checkout');
  };

  // Expose handlers via refs if provided
  useEffect(() => {
    if (onAddToCartRef) {
      onAddToCartRef.current = handleAddProduct;
    }
    if (onProceedToBuyRef) {
      onProceedToBuyRef.current = handleProceedToBuy;
    }
  }, [onAddToCartRef, onProceedToBuyRef, handleAddProduct, handleProceedToBuy]);

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          {replaceTextCharacters(title, '*', '')}
        </h1>

        {productPromo?.offerBanner && (
          <Image
            src={productPromo.offerBanner.src}
            alt={productPromo.offerBanner.alt}
            title={productPromo.offerBanner.title}
            width={productPromo.offerBanner.width}
            height={productPromo.offerBanner.height}
            className="h-auto w-full rounded-lg"
            sizes="(min-width: 1024px) 584px, calc(100vw - 32px)"
            priority
          />
        )}
      </div>

      {sku && (
        <div className="flex items-center gap-2 text-sm font-bold text-foreground">
          {/* <Package className="w-4 h-4" /> */}
          <span>ITEM NUMBER: {sku}</span>
        </div>
      )}


      {/* Rating and Status */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Popover open={isReviewsPopoverOpen} onOpenChange={setIsReviewsPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1 -m-1"
              aria-label={`View ${reviews?.length || 0} review${reviews?.length !== 1 ? 's' : ''}`}
            >
              <ProductRating
                rating={ratingVal}
                reviewCount={reviews?.length || 0}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[90vw] sm:w-[420px] p-0"
            align="start"
            side="bottom"
            sideOffset={8}
          >
            <div className="flex flex-col" style={{ maxHeight: '400px' }}>
              {/* Header */}
              <div className="p-3 border-b shrink-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                    <h3 className="font-semibold text-foreground text-sm">
                      Customer Reviews
                    </h3>
                    {reviews && reviews.length > 0 && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full shrink-0">
                        {reviews.length}
                      </span>
                    )}
                  </div>
                  {reviews && reviews.length > 0 && (
                    <span className="text-xs text-muted-foreground shrink-0">
                      Avg: {ratingVal.toFixed(1)}/5
                    </span>
                  )}
                </div>
              </div>

              {/* Reviews List - Scrollable */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full" style={{ height: '280px' }}>
                  <div className="p-3 space-y-3">
                    {reviews && reviews.length > 0 ? (
                      reviews.map((review, index) => (
                        <ReviewItem key={review._id || index} review={review} />
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm font-medium text-foreground mb-1">
                          No reviews yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Be the first to review this product!
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Footer with Add Review Button */}
              <div className="p-3 border-t shrink-0">
                <Dialog
                  open={isReviewDialogOpen}
                  onOpenChange={setIsReviewDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      onClick={handleReviewButtonClick}
                      className="w-full flex items-center justify-center gap-2 h-9 text-sm"
                      variant="outline"
                    >
                      <Plus className="w-3 h-3" />
                      Add Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <ReviewForm
                      productId={productItem?._id}
                      onSuccess={() => {
                        setIsReviewDialogOpen(false);
                        setIsReviewsPopoverOpen(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-2">
          {!outOfStock ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">In Stock</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Pricing - finalPriceDiscount is single source of truth; marked = original base */}
      <div className="space-y-3">
        <div className="flex items-baseline gap-3">
          {showMarkedPrice && (
            <span className="text-lg text-muted-foreground line-through">
              {CURRENCY_SYMBOL}{calculateMarkedUpPrice()}
            </span>
          )}
          <span className="text-3xl font-bold text-foreground">
            {CURRENCY_SYMBOL}{calculateFinalPrice()}
          </span>
        </div>

        {selectedOption && (
          <Badge variant="secondary" className="text-sm">
            {selectedOption.title}
          </Badge>
        )}

        {/* Shipping Calculated Text */}
        <p className="text-base text-foreground">
          <Link
            href="/shipping"
            className="underline hover:no-underline font-medium"
          >
            Shipping
          </Link>{' '}
          calculated at checkout.
        </p>

      </div>

      {/* Color Options */}
      {imageURLs?.some(item => item?.color && item?.color?.name) && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Color</h3>
          <div className="flex flex-wrap gap-3">
            {imageURLs
              .filter(item => item?.color && item?.color?.name)
              .map((item, i) => (
                <button
                  onClick={() => handleImageActive(item)}
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{ backgroundColor: item?.color?.clrCode }}
                  title={item?.color?.name}
                  aria-label={`Select color ${item?.color?.name}`}
                />
              ))}
          </div>
        </div>
      )}

      {/* Countdown Timer */}
      {offerDate?.endDate && (
        <ProductDetailsCountdown offerExpiryTime={offerDate?.endDate} />
      )}

      {/* Product Options */}
      {options && options.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-medium text-foreground">Options</h3>

          <div className="relative">
            <select
              className="w-full px-3 py-2.5 border border-input rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary transition-all"
              onChange={handleOptionChange}
              value={
                selectedOption ? options.indexOf(selectedOption).toString() : ''
              }
            >
              <option value="">Choose an option...</option>
              {options.map((option, index) => (
                <option key={index} value={index}>
                  {option.title}
                  {option.price && Number(option.price) !== 0
                    ? ` (+${CURRENCY_SYMBOL}${Number(option.price).toFixed(2)})`
                    : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Product Configurations */}
      {productConfigurations &&
        productConfigurations.length > 0 && (
          <div className="space-y-6">
            {/* Render configurations with options (when custom note is disabled) */}
            {productConfigurations.some(
              config => !config.enableCustomNote && config.options && config.options.length > 0
            ) && (
                <ProductConfigurations
                  configurations={productConfigurations}
                  onConfigurationChange={(configIndex, optionIndex, option) => {
                    // Update selected configurations state
                    setSelectedConfigurations(prev => ({
                      ...prev,
                      [configIndex]: { optionIndex, option },
                    }));

                    // Update main product image if this option has an image
                    if (option && option.image && handleImageActive) {
                      handleImageActive(option.image);
                    }
                  }}
                />
              )}
            {/* Custom Note Fields (when custom note is enabled) */}
            {productConfigurations.map((config, configIndex) => {
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

      {/* Add to Cart Section - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block space-y-4">
        <div className="flex items-center gap-4">
          <ProductQuantity productItem={productItem} />
          <Button
            onClick={() => handleAddProduct(productItem)}
            disabled={outOfStock}
            size="lg"
            className="flex-1 h-12 text-base font-medium"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center sm:flex-row gap-3">
        <Button
          onClick={() => handleWishlistProduct(productItem)}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
        >
          <Heart className="w-5 h-5 mr-2" />
          Add to Wishlist
        </Button>
        {/* <Button
          onClick={() => handleCompareProduct(productItem)}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
        >
          <BarChart3 className="w-5 h-5 mr-2" />
          Add to Compare
        </Button> */}
        {/* Share Button */}
        <div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 w-full sm:w-auto"
            onClick={async () => {
              const productUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}${pathname}`;
              const shareTitle = replaceTextCharacters(title, '*', '');
              const shareText = `Check out ${shareTitle} on Intimate Apparel!`;

              // Try Web Share API first (mobile and modern browsers)
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: shareTitle,
                    text: shareText,
                    url: productUrl,
                  });
                  return;
                } catch (err) {
                  // User cancelled or error occurred, fallback to copy
                  if (err.name !== 'AbortError') {
                    console.error('Error sharing:', err);
                  }
                }
              }

              // Fallback: Copy to clipboard
              try {
                await navigator.clipboard.writeText(productUrl);
                notifySuccess('Product link copied to clipboard!');
              } catch (err) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = productUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                notifySuccess('Product link copied to clipboard!');
              }
            }}
            aria-label="Share product"
            title="Share product"
          >
            <Share2 className="w-4 h-4 mr-2" />
            <span className="text-sm">Share</span>
          </Button>
        </div>


      </div>



      {/* Product Details */}
      <div className="space-y-4">


        {tags && tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>



      {/* <Separator /> */}

      {/* Product Information Accordion - Desktop */}
      <div className="hidden lg:block">
        <Accordion
          type="multiple"
          defaultValue={[]}
          className="w-full"
        >
          <AccordionItem value="description" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Product Description</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 em-text">
                <div
                  className="prose product-rich-text max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>



          <AccordionItem value="reviews" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Customer Reviews</span>
                {reviews && reviews.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-2">
                    {reviews.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-6">
                {reviews && reviews.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <ReviewItem key={index} review={review} />
                      ))}
                    </div>
                    <Separator />

                    {/* Add Review Button */}
                    <div className="flex justify-center">
                      <Dialog
                        open={isReviewDialogOpen}
                        onOpenChange={setIsReviewDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            onClick={handleReviewButtonClick}
                            className="flex items-center gap-2"
                            variant="outline"
                          >
                            <Plus className="w-4 h-4" />
                            Add Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                          </DialogHeader>
                          <ReviewForm
                            productId={productItem?._id}
                            onSuccess={() => setIsReviewDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to review this product!
                    </p>
                    <Separator className="my-6" />

                    {/* Add Review Button */}
                    <div className="flex justify-center">
                      <Dialog
                        open={isReviewDialogOpen}
                        onOpenChange={setIsReviewDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            onClick={handleReviewButtonClick}
                            className="flex items-center gap-2"
                            variant="outline"
                          >
                            <Plus className="w-4 h-4" />
                            Add Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Write a Review</DialogTitle>
                          </DialogHeader>
                          <ReviewForm
                            productId={productItem?._id}
                            onSuccess={() => setIsReviewDialogOpen(false)}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* FAQs Section - Only show if FAQs exist */}
          {faqs && faqs.trim() !== '' && (
            <AccordionItem value="faqs" className="border-border/50">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span>Frequently Asked Questions (FAQs)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 em-text">
                  <div
                    className="prose product-rich-text max-w-none"
                    dangerouslySetInnerHTML={{ __html: faqs }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="shipping" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Shipping Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      30 days easy returns
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      Secure payments with leading payment providers
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Product Information Accordion - Mobile */}
      <div className="lg:hidden">
        <Accordion
          type="multiple"
          defaultValue={[]}
          className="w-full"
        >
          <AccordionItem value="description" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Product Description</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <div
                  className="prose prose-sm product-rich-text max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* FAQs Section - Only show if FAQs exist */}
          {faqs && faqs.trim() !== '' && (
            <AccordionItem value="faqs" className="border-border/50">
              <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <span>Frequently Asked Questions</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4">
                  <div
                    className="prose prose-sm product-rich-text max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: faqs }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="reviews" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span>Customer Reviews</span>
                {reviews && reviews.length > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-2">
                    {reviews.length}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4 space-y-6">
                {reviews && reviews.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <ReviewItem key={index} review={review} />
                      ))}
                    </div>
                    <Separator />
                    <ReviewForm productId={productItem?._id} />
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Be the first to review this product!
                    </p>
                    <Separator className="my-6" />
                    <ReviewForm productId={productItem?._id} />
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="shipping" className="border-border/50">
            <AccordionTrigger className="text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                <span>Shipping Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      30 days easy returns
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">
                      Secure payments with leading payment providers
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed bar on mobile */}


      <div className="h-20 md:h-0" />
    </div>
  );
}
