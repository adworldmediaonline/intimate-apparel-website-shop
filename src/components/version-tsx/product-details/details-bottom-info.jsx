'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/authClient';
import {
  CheckCircle,
  FileText,
  MessageSquare,
  Plus,
  Truck,
} from 'lucide-react';
import { useState } from 'react';
import ReviewForm from './review-form';
import ReviewItem from './review-item';

const DetailsBottomInfo = ({ productItem }) => {
  const { description, reviews = [], specifications = {} } = productItem || {};
  const { data: session } = authClient.useSession();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Opens for everyone. The missing-session `return` this replaced did
  // nothing at all on click — no dialog, no prompt — which is what made
  // Write a Review look broken for signed-out visitors.
  const handleReviewButtonClick = () => {
    setIsReviewDialogOpen(true);
  };

  return (
    <div className="lg:hidden">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="description" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Description</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Reviews</span>
            {reviews.length > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {reviews.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span className="hidden sm:inline">Shipping</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Product Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm product-rich-text max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Customer Reviews
                {reviews.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">
                    ({reviews.length} reviews)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {reviews.length > 0 ? (
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shipping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <span className="text-foreground">30 days easy returns</span>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DetailsBottomInfo;
