import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Heart, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockOrders } from '@/lib/mock-data';

export default function BuyerDashboard() {
  const { user } = useAuth();
  const recentOrders = mockOrders.slice(0, 3);

  const stats = [
    { icon: Package, label: 'Total Orders', value: mockOrders.length, color: 'text-primary' },
    { icon: Heart, label: 'Wishlist Items', value: 5, color: 'text-destructive' },
    { icon: Star, label: 'Reviews Given', value: 3, color: 'text-accent' },
    { icon: ShoppingBag, label: 'Products Bought', value: 12, color: 'text-info' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-success text-success-foreground';
      case 'processing': return 'bg-warning text-warning-foreground';
      case 'shipped': return 'bg-info text-info-foreground';
      case 'cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <MainLayout>
      <div className="container py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {user?.firstName || 'Buyer'}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-full bg-muted flex items-center justify-center`}>
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

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button asChild size="lg" className="h-auto py-6">
            <Link to="/products">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Browse Products
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto py-6">
            <Link to="/buyer/orders">
              <Package className="h-5 w-5 mr-2" />
              View Orders
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-auto py-6">
            <Link to="/buyer/wishlist">
              <Heart className="h-5 w-5 mr-2" />
              My Wishlist
            </Link>
          </Button>
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/buyer/orders">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items • {order.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <span className="font-semibold">₹{order.totalAmount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No orders yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
