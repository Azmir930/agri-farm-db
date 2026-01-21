import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, ChevronLeft, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProductById } from '@/data/mockProducts';

const WriteReview = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const product = getProductById(productId || '');

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Product not found</p>
          <Button asChild>
            <Link to="/buyer/products">Browse Products</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Please select a rating',
        description: 'Choose between 1 to 5 stars',
        variant: 'destructive',
      });
      return;
    }

    if (reviewText.trim().length < 10) {
      toast({
        title: 'Review too short',
        description: 'Please write at least 10 characters',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: 'Review submitted!',
        description: 'Thank you for your feedback.',
      });

      navigate(`/buyer/products/${productId}`);
    } catch (error) {
      toast({
        title: 'Failed to submit review',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Write a Review</h1>
            <p className="text-muted-foreground">Share your experience with this product</p>
          </div>
        </div>

        {/* Product Info */}
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="h-20 w-20 bg-muted rounded-lg flex-shrink-0">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <p className="text-sm text-muted-foreground">by {product.farmerName}</p>
              <p className="text-primary font-medium mt-1">
                ₹{product.price}/{product.unit}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Review Form */}
        <Card>
          <CardHeader>
            <CardTitle>Your Review</CardTitle>
            <CardDescription>
              Your review helps other buyers make informed decisions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Star Rating */}
            <div className="space-y-3">
              <Label>Rating *</Label>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-110"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(hoverRating || rating) > 0 && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {ratingLabels[hoverRating || rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-3">
              <Label htmlFor="review">Your Review *</Label>
              <Textarea
                id="review"
                placeholder="Share your experience with this product. What did you like or dislike? Would you recommend it to others?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {reviewText.length} / 500 characters
              </p>
            </div>

            {/* Tips */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium text-sm mb-2">Tips for a helpful review:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Describe the quality and freshness of the product</li>
                <li>• Mention if the product matched the description</li>
                <li>• Share your experience with packaging and delivery</li>
                <li>• Would you buy from this farmer again?</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={handleSubmit}
                disabled={isSubmitting || rating === 0}
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WriteReview;
