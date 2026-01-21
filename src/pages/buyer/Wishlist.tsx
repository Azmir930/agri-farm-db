import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { mockProducts } from '@/data/mockProducts';

// Mock wishlist items (subset of products)
const initialWishlist = mockProducts.slice(0, 5).map((p) => ({
  ...p,
  addedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
}));

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState(initialWishlist);
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleRemoveFromWishlist = (productId: string) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== productId));
    toast({
      title: 'Removed from wishlist',
      description: 'Item has been removed from your wishlist.',
    });
  };

  const handleAddToCart = (product: (typeof initialWishlist)[0]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      unit: product.unit,
      image: product.image,
      farmerId: product.farmerId,
      farmerName: product.farmerName,
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((product) => {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit,
        image: product.image,
        farmerId: product.farmerId,
        farmerName: product.farmerName,
      });
    });
    setWishlistItems([]);
    toast({
      title: 'All items added to cart',
      description: 'Your wishlist items have been moved to cart.',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Heart className="h-6 w-6 text-red-500" />
              My Wishlist
            </h1>
            <p className="text-muted-foreground">
              {wishlistItems.length} items saved for later
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <Button onClick={handleMoveAllToCart} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Add All to Cart
            </Button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <Card className="py-12">
            <CardContent className="text-center">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Your wishlist is empty</h3>
              <p className="text-muted-foreground mb-4">
                Save items you like by clicking the heart icon on products
              </p>
              <Button asChild>
                <Link to="/buyer/products">Browse Products</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {/* Product Image */}
                    <Link
                      to={`/buyer/products/${item.id}`}
                      className="sm:w-48 aspect-video sm:aspect-square bg-muted flex-shrink-0"
                    >
                      <img
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1 p-4 flex flex-col">
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <Badge variant="secondary" className="mb-2">
                              {item.category}
                            </Badge>
                            <Link
                              to={`/buyer/products/${item.id}`}
                              className="hover:text-primary"
                            >
                              <h3 className="font-semibold text-lg">{item.name}</h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mt-1">
                              by {item.farmerName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-primary">
                              ₹{item.price}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              per {item.unit}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{item.rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({item.reviewCount})
                            </span>
                          </div>
                          <Badge variant={item.stock > 10 ? 'default' : 'destructive'}>
                            {item.stock > 10 ? 'In Stock' : `Only ${item.stock} left`}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                        <Button
                          className="flex-1 sm:flex-none gap-2"
                          onClick={() => handleAddToCart(item)}
                          disabled={item.stock === 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;
