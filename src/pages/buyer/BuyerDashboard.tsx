import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProductCard, Product } from '@/components/dashboard/ProductCard';
import { RecentActivity, Activity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Package, Heart, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    description: 'Fresh organic tomatoes grown without pesticides',
    price: 60,
    unit: 'kg',
    category: 'Vegetables',
    stock: 50,
    rating: 4.8,
    reviewCount: 124,
    farmerId: 'f1',
    farmerName: 'Green Acres Farm',
  },
  {
    id: '2',
    name: 'Fresh Spinach',
    description: 'Nutrient-rich spinach leaves, harvested daily',
    price: 40,
    unit: 'bunch',
    category: 'Leafy Greens',
    stock: 30,
    rating: 4.6,
    reviewCount: 89,
    farmerId: 'f2',
    farmerName: 'Valley Organics',
  },
  {
    id: '3',
    name: 'Basmati Rice',
    description: 'Premium aged basmati rice from Punjab',
    price: 120,
    unit: 'kg',
    category: 'Grains',
    stock: 100,
    rating: 4.9,
    reviewCount: 256,
    farmerId: 'f3',
    farmerName: 'Golden Harvest',
  },
  {
    id: '4',
    name: 'Fresh Mangoes',
    description: 'Alphonso mangoes, naturally ripened',
    price: 150,
    unit: 'dozen',
    category: 'Fruits',
    stock: 25,
    rating: 4.7,
    reviewCount: 178,
    farmerId: 'f1',
    farmerName: 'Green Acres Farm',
  },
];

const mockActivities: Activity[] = [
  { id: '1', type: 'order', message: 'Your order #ORD-045 has been shipped', time: '30 minutes ago' },
  { id: '2', type: 'product', message: 'Fresh Mangoes back in stock!', time: '2 hours ago' },
  { id: '3', type: 'review', message: 'Your review on Organic Tomatoes was published', time: '1 day ago' },
];

const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Leafy Greens', 'Dairy'];

const BuyerDashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addItem, itemCount, total } = useCart();
  const { toast } = useToast();

  const filteredProducts =
    selectedCategory === 'All'
      ? mockProducts
      : mockProducts.filter((p) => p.category === selectedCategory);

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
          <StatCard title="Wishlist Items" value="5" icon={Heart} />
          <StatCard title="Total Orders" value="12" icon={Package} />
          <StatCard title="Pending Delivery" value="2" icon={Truck} />
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
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                  <TabsList className="flex-wrap h-auto gap-2">
                    {categories.map((cat) => (
                      <TabsTrigger key={cat} value={cat} className="px-4">
                        {cat}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* Products Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onAddToWishlist={handleAddToWishlist}
                    />
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No products found in this category
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <RecentActivity activities={mockActivities} title="Your Activity" />

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
