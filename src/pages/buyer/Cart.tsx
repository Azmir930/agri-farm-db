import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/contexts/CartContext';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalAmount } = useCart();

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started</p>
          <Button asChild>
            <Link to="/products">Browse Products</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/products" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <img
                        src={item.product.images[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <Link to={`/products/${item.product.id}`} className="font-semibold hover:text-primary">
                        {item.product.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">{item.product.category}</p>
                      <p className="text-sm text-muted-foreground">by {item.product.farmerName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-semibold">
                            ₹{item.product.price * item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>{totalAmount >= 500 ? 'Free' : '₹50'}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{totalAmount >= 500 ? totalAmount : totalAmount + 50}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" asChild>
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
