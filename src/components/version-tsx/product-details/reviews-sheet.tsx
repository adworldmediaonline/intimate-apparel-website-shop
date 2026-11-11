'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReviewItem from './review-item';
import ReviewForm from './review-form';
import { MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { authClient } from '@/lib/authClient';

interface ReviewsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviews: any[];
  productId: string;
  productTitle?: string;
  averageRating: number;
}

const ReviewsSheet = ({
  open,
  onOpenChange,
  reviews,
  productId,
  productTitle,
  averageRating,
}: ReviewsSheetProps) => {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  /**
   * Opens for everyone.
   *
   * This used to `return` on a missing session — so a signed-out visitor
   * pressing Add Review got nothing at all: no dialog, no prompt, no error.
   * That silent no-op is what "write a review not working" actually was on
   * the front end; the purchase gate on the API was the second half of it.
   */
  const handleReviewButtonClick = () => {
    setIsReviewDialogOpen(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Customer Reviews
            {reviews && reviews.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-2">
                {reviews.length}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            {productTitle && (
              <span className="text-foreground font-medium">{productTitle}</span>
            )}
            {reviews && reviews.length > 0 && (
              <span className="text-muted-foreground ml-2">
                • Average Rating: {averageRating.toFixed(1)}/5
              </span>
            )}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {reviews && reviews.length > 0 ? (
              <>
                <div className="space-y-4">
                  {reviews.map((review, index) => (
                    <ReviewItem key={review._id || index} review={review} />
                  ))}
                </div>
                <Separator />
              </>
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">
                  No reviews yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Be the first to review this product!
                </p>
              </div>
            )}

            {/* Add Review Section */}
            <div className="space-y-4">
              <Separator />
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
                      productId={productId}
                      onSuccess={() => {
                        setIsReviewDialogOpen(false);
                        onOpenChange(false);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ReviewsSheet;

