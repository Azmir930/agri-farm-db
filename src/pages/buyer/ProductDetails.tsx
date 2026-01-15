import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Minus, Plus, ShoppingCart, Heart, Truck, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';
import { mockProducts, mockReviews } from '@/lib/mock-data';
import { toast } from '@/hooks/use-toast';

export default function ProductDetails() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  const product = mockProducts.find(p => p.id === id);
  const productReviews = mockReviews.filter(r => r.productId === id);

  if (!product) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Product not found</h1>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleAddToWishlist = () => {
    toast({ title: 'Added to wishlist', description: `${product.name} added to your wishlist` });
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/products" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={product.images[0] || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <Badge className="mb-3">{product.category}</Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-accent text-accent' : 'text-muted'}`}
                  />
                ))}
              </div>
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
            </div>

            <p className="text-muted-foreground mb-4">
              Sold by <Link to="#" className="text-primary hover:underline">{product.farmerName}</Link>
            </p>

            <p className="text-lg mb-6">{product.description}</p>

            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-primary">₹{product.price}</span>
              <span className="text-lg text-muted-foreground">/{product.unit}</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <span className="text-muted-foreground">
                {product.stock} {product.unit}s available
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline" onClick={handleAddToWishlist}>
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Truck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-sm text-muted-foreground">On orders over ₹500</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Shield className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">Quality Assured</p>
                    <p className="text-sm text-muted-foreground">100% organic</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Reviews Tab */}
        <Tabs defaultValue="reviews" className="mb-12">
          <TabsList>
            <TabsTrigger value="reviews">Reviews ({productReviews.length})</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          <TabsContent value="reviews" className="mt-6">
            {productReviews.length > 0 ? (
              <div className="space-y-4">
                {productReviews.map(review => (
                  <Card key={review.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.userName}</span>
                        <span className="text-muted-foreground text-sm">{review.createdAt}</span>
                      </div>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No reviews yet.</p>
            )}
          </TabsContent>
          <TabsContent value="details" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="font-medium">{product.category}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Unit</dt>
                    <dd className="font-medium">{product.unit}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Stock</dt>
                    <dd className="font-medium">{product.stock} available</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Farmer</dt>
                    <dd className="font-medium">{product.farmerName}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
