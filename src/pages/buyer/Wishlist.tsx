import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/hooks/useWishlist';

const Wishlist = () => {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { items: wishlistItems, isLoading, removeFromWishlist, isRemoving } = useWishlist();

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      await removeFromWishlist(productId);
      toast({
        title: 'Removed from wishlist',
        description: 'Item has been removed from your wishlist.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to remove from wishlist.',
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = (item: typeof wishlistItems[0]) => {
    if (!item.product) return;
    
    addItem({
      productId: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      quantity: 1,
      unit: item.product.unit,
      image: item.product.image_url || undefined,
      farmerId: item.product.farmer_id,
      farmerName: 'Farmer',
    });
    toast({
      title: 'Added to cart',
      description: `${item.product.name} has been added to your cart.`,
    });
  };

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => {
      if (item.product) {
        addItem({
          productId: item.product.id,
          name: item.product.name,
          price: Number(item.product.price),
          quantity: 1,
          unit: item.product.unit,
          image: item.product.image_url || undefined,
          farmerId: item.product.farmer_id,
          farmerName: 'Farmer',
        });
      }
    });
    toast({
      title: 'All items added to cart',
      description: 'Your wishlist items have been moved to cart.',
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

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
            {wishlistItems.map((item) => {
              const product = item.product;
              if (!product) return null;
              
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Product Image */}
                      <Link
                        to={`/buyer/products/${product.id}`}
                        className="sm:w-48 aspect-video sm:aspect-square bg-muted flex-shrink-0"
                      >
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 p-4 flex flex-col">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Link
                                to={`/buyer/products/${product.id}`}
                                className="hover:text-primary"
                              >
                                <h3 className="font-semibold text-lg">{product.name}</h3>
                              </Link>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-primary">
                                ₹{Number(product.price)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                per {product.unit}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>
                              {product.stock > 10 ? 'In Stock' : `Only ${product.stock} left`}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                          <Button
                            className="flex-1 sm:flex-none gap-2"
                            onClick={() => handleAddToCart(item)}
                            disabled={product.stock === 0}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            disabled={isRemoving}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;
