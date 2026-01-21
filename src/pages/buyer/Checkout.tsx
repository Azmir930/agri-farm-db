import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateOrder } from '@/hooks/useOrders';

const paymentMethods = [
  { id: 'upi', name: 'UPI', description: 'Pay using UPI apps' },
  { id: 'card', name: 'Credit/Debit Card', description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', name: 'Net Banking', description: 'All major banks' },
  { id: 'cod', name: 'Cash on Delivery', description: 'Pay when you receive' },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  
  // Address form state
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    state: '',
  });

  const deliveryFee = total >= 500 ? 0 : 40;
  const discount = promoApplied ? Math.round(total * 0.1) : 0;
  const grandTotal = total + deliveryFee - discount;

  if (items.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Your cart is empty</p>
          <Button asChild>
            <Link to="/buyer/products">Browse Products</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'FRESH10') {
      setPromoApplied(true);
      toast({
        title: 'Promo code applied!',
        description: '10% discount has been applied to your order.',
      });
    } else {
      toast({
        title: 'Invalid promo code',
        description: 'Please enter a valid promo code.',
        variant: 'destructive',
      });
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city || !address.state) {
      toast({
        title: 'Address required',
        description: 'Please fill in your delivery address.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        productName: item.name,
        farmerId: item.farmerId,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      await createOrder.mutateAsync({
        items: orderItems,
        deliveryAddress: address.line1,
        deliveryCity: address.city,
        deliveryState: address.state,
        deliveryFee,
        paymentMethod: selectedPayment,
        notes: promoApplied ? 'Promo: FRESH10 applied' : undefined,
      });
      
      clearCart();
      
      toast({
        title: 'Order placed successfully!',
        description: 'Your order has been confirmed.',
      });
      
      navigate('/buyer/orders');
    } catch (error) {
      toast({
        title: 'Order failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-muted-foreground">{items.length} items in your order</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Address & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <CardTitle>Delivery Address</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter your street address"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="City"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <CardTitle>Payment Method</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => (
                      <Label
                        key={method.id}
                        htmlFor={method.id}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all ${
                          selectedPayment === method.id
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div>
                            <p className="font-medium">{method.name}</p>
                            <p className="text-sm text-muted-foreground">{method.description}</p>
                          </div>
                        </div>
                      </Label>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded bg-muted flex-shrink-0">
                        <img
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          className="h-full w-full object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit} × ₹{item.price}
                        </p>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Promo Code */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyPromo}
                    disabled={promoApplied || !promoCode}
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </Button>
                </div>
                {!promoApplied && (
                  <p className="text-xs text-muted-foreground">Try: FRESH10 for 10% off</p>
                )}

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-primary' : ''}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Discount (10%)</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${grandTotal}`}
                </Button>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Checkout;
