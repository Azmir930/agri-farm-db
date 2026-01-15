import { Link } from 'react-router-dom';
import { Package, Plus, Star, TrendingUp, ArrowRight, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockProducts, mockOrders, mockReviews } from '@/lib/mock-data';

export default function FarmerDashboard() {
  const { user } = useAuth();
  
  // Filter farmer's products and orders
  const farmerProducts = mockProducts.filter(p => p.farmerId === 'f1').slice(0, 4);
  const farmerOrders = mockOrders.slice(0, 3);
  const farmerReviews = mockReviews.slice(0, 3);

  const stats = [
    { icon: Package, label: 'Active Products', value: 12, color: 'text-primary' },
    { icon: TrendingUp, label: 'Total Orders', value: 45, color: 'text-success' },
    { icon: DollarSign, label: 'Revenue', value: '₹24,500', color: 'text-accent' },
    { icon: Star, label: 'Avg Rating', value: '4.6', color: 'text-warning' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success text-success-foreground';
      case 'processing': return 'bg-warning text-warning-foreground';
      case 'shipped': return 'bg-info text-info-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Welcome */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome, {user?.firstName || 'Farmer'}!
            </h1>
            <p className="text-muted-foreground">Manage your farm products and orders</p>
          </div>
          <Button asChild>
            <Link to="/farmer/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/farmer/orders">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farmerOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} items</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <span className="font-semibold">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Reviews</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/farmer/reviews">
                  View all <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {farmerReviews.map(review => (
                  <div key={review.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.productName}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Products */}
        <Card className="mt-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Products</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/farmer/products">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {farmerProducts.map(product => (
                <div key={product.id} className="border rounded-lg p-4">
                  <div className="aspect-square bg-muted rounded mb-3">
                    <img src={product.images[0] || '/placeholder.svg'} alt={product.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <h3 className="font-medium line-clamp-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">Stock: {product.stock}</p>
                  <p className="font-semibold text-primary">₹{product.price}/{product.unit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
