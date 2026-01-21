import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductCard, Product } from '@/components/dashboard/ProductCard';
import { RecentActivity, Activity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, Heart, Truck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useWishlist } from '@/hooks/useWishlist';
import { useOrders } from '@/hooks/useOrders';

const BuyerDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem, itemCount, total } = useCart();
  const { toast } = useToast();
  
  const { data: products = [], isLoading: productsLoading } = useProducts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { items: wishlistItems } = useWishlist();
  const { data: orders = [] } = useOrders();

  const allCategories = ['All', ...categories.map(c => c.name)];

  const filteredProducts =
    selectedCategory === 'All'
      ? products.slice(0, 8)
      : products.filter((p) => p.categories?.name === selectedCategory).slice(0, 8);

  const pendingOrders = orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length;

  const handleAddToCart = (product: Product) => {
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

  const handleAddToWishlist = (product: Product) => {
    toast({
      title: 'Added to wishlist',
      description: `${product.name} has been added to your wishlist.`,
    });
  };

  // Transform database products to ProductCard format
  const transformedProducts: Product[] = filteredProducts.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    unit: p.unit,
    category: p.categories?.name || 'Other',
    stock: p.stock,
    rating: 0,
    reviewCount: 0,
    farmerId: p.farmer_id,
    farmerName: p.farmer_name || 'Unknown Farmer',
    image: p.image_url || undefined,
  }));

  const recentActivities: Activity[] = orders.slice(0, 3).map(order => ({
    id: order.id,
    type: 'order' as const,
    message: `Order ${order.order_number} is ${order.status}`,
    time: new Date(order.created_at).toLocaleDateString(),
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back!</h1>
            <p className="text-muted-foreground">Discover fresh produce from local farmers</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/buyer/cart">
              <ShoppingCart className="h-4 w-4" />
              Cart ({itemCount}) - ₹{total}
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Items in Cart" value={itemCount} icon={ShoppingCart} />
          <StatCard title="Wishlist Items" value={wishlistItems.length} icon={Heart} />
          <StatCard title="Total Orders" value={orders.length} icon={Package} />
          <StatCard title="Pending Delivery" value={pendingOrders} icon={Truck} />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Products Section */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Featured Products</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/buyer/products">View All Products</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Category Tabs */}
                {categoriesLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                    <TabsList className="flex-wrap h-auto gap-2">
                      {allCategories.map((cat) => (
                        <TabsTrigger key={cat} value={cat} className="px-4">
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>
                )}

                {/* Products Grid */}
                {productsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {transformedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                      />
                    ))}
                  </div>
                )}

                {!productsLoading && transformedProducts.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No products found in this category
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity activities={recentActivities} title="Your Activity" />

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/buyer/orders">
                    <Truck className="mr-2 h-4 w-4" />
                    Track Orders
                  </Link>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <Link to="/buyer/wishlist">
                    <Heart className="mr-2 h-4 w-4" />
                    View Wishlist
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
