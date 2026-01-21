import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Star,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  Store,
  MapPin,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { getProductById, mockProducts } from '@/data/mockProducts';

const mockReviews = [
  {
    id: '1',
    userName: 'Priya Sharma',
    rating: 5,
    date: '2024-01-10',
    comment: 'Excellent quality! Fresh and organic as promised. Will buy again.',
    helpful: 12,
  },
  {
    id: '2',
    userName: 'Amit Patel',
    rating: 4,
    date: '2024-01-08',
    comment: 'Good quality produce. Delivery was on time. Slightly expensive.',
    helpful: 8,
  },
  {
    id: '3',
    userName: 'Sunita Devi',
    rating: 5,
    date: '2024-01-05',
    comment: 'Love supporting local farmers. Product quality is consistently great.',
    helpful: 15,
  },
];

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  const product = getProductById(id || '');

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

  const relatedProducts = mockProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      unit: product.unit,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
    });
    toast({
      title: 'Added to cart',
      description: `${quantity} ${product.unit} of ${product.name} added to cart.`,
    });
  };

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      unit: product.unit,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
    });
    navigate('/buyer/checkout');
  };

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? 'Removed from wishlist' : 'Added to wishlist',
      description: isWishlisted
        ? `${product.name} removed from wishlist`
        : `${product.name} added to wishlist`,
    });
  };

  const ratingDistribution = [
    { stars: 5, count: 85, percentage: 68 },
    { stars: 4, count: 25, percentage: 20 },
    { stars: 3, count: 10, percentage: 8 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 1, percentage: 2 },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="gap-1 p-0 h-auto" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <span>/</span>
          <Link to="/buyer/products" className="hover:text-foreground">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Image */}
          <Card className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              <img
                src={product.image || '/placeholder.svg'}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </Card>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{product.rating}</span>
                  <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
                </div>
                <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                  {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                </Badge>
              </div>
            </div>

            <div className="text-3xl font-bold text-primary">
              ₹{product.price}
              <span className="text-lg font-normal text-muted-foreground">/{product.unit}</span>
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Farmer Info */}
            <Card>
              <CardContent className="flex items-center gap-4 pt-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {product.farmerName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{product.farmerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>Local Farm</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  View Farm
                </Button>
              </CardContent>
            </Card>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-sm text-muted-foreground">
                Total: ₹{(product.price * quantity).toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button className="flex-1 gap-2" onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </Button>
              <Button variant="secondary" className="flex-1" onClick={handleBuyNow}>
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleWishlist}
                className={isWishlisted ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Delivery Info */}
            <div className="grid gap-3 pt-4 border-t">
              <div className="flex items-center gap-3 text-sm">
                <Truck className="h-5 w-5 text-primary" />
                <span>Free delivery on orders above ₹500</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-5 w-5 text-primary" />
                <span>Quality guaranteed by AgriMarket</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span>Easy returns within 24 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs: Description & Reviews */}
        <Tabs defaultValue="reviews" className="mt-8">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <p>{product.description}</p>
                <Separator />
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit:</span>
                    <span>per {product.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seller:</span>
                    <span>{product.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stock:</span>
                    <span>{product.stock} available</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Rating Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold">{product.rating}</div>
                    <div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(product.rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.reviewCount} reviews</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {ratingDistribution.map((item) => (
                      <div key={item.stars} className="flex items-center gap-2">
                        <span className="w-3 text-sm">{item.stars}</span>
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <Progress value={item.percentage} className="h-2 flex-1" />
                        <span className="w-8 text-xs text-muted-foreground">{item.count}</span>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full" asChild>
                    <Link to={`/buyer/review/${product.id}`}>Write a Review</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Reviews List */}
              <div className="lg:col-span-2 space-y-4">
                {mockReviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.userName}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 ${
                                      star <= review.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-muted-foreground">{review.comment}</p>
                      <div className="mt-3 flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          Helpful ({review.helpful})
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Related Products</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <Link to={`/buyer/products/${p.id}`}>
                    <div className="aspect-video bg-muted">
                      <img
                        src={p.image || '/placeholder.svg'}
                        alt={p.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="pt-3">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-primary font-bold">₹{p.price}/{p.unit}</p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProductDetails;
