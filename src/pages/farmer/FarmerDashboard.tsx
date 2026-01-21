import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrdersTable } from '@/components/dashboard/OrdersTable';
import { RecentActivity, Activity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, IndianRupee, Star, Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFarmerProducts } from '@/hooks/useProducts';
import { useFarmerOrders } from '@/hooks/useOrders';
import { useFarmerReviews } from '@/hooks/useReviews';
import { useAuth } from '@/contexts/AuthContext';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { data: products = [], isLoading: productsLoading } = useFarmerProducts(user?.id);
  const { data: orders = [], isLoading: ordersLoading } = useFarmerOrders();
  const { data: reviews = [] } = useFarmerReviews();

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const recentActivities: Activity[] = orders.slice(0, 4).map(order => ({
    id: order.id,
    type: 'order' as const,
    message: `Order ${order.order_number} - ${order.status}`,
    time: new Date(order.created_at).toLocaleDateString(),
  }));

  const tableOrders = orders.slice(0, 5).map(o => ({
    id: o.id,
    orderNumber: o.order_number,
    customerName: 'Customer',
    products: o.order_items.map(item => ({ name: item.product_name, quantity: item.quantity })),
    total: Number(o.total_amount),
    status: o.status as 'pending' | 'processing' | 'shipped' | 'delivered',
    date: new Date(o.created_at).toLocaleDateString(),
  }));

  const isLoading = productsLoading || ordersLoading;

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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Farmer Dashboard</h1>
            <p className="text-muted-foreground">Manage your farm products and orders</p>
          </div>
          <Button asChild className="gap-2">
            <Link to="/farmer/products/new">
              <Plus className="h-4 w-4" />
              Add New Product
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Products" value={products.length} icon={Package} />
          <StatCard title="Pending Orders" value={pendingOrders} icon={Truck} />
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={IndianRupee} />
          <StatCard title="Avg. Rating" value={avgRating.toFixed(1)} icon={Star} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/farmer/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={tableOrders} />
              </CardContent>
            </Card>
          </div>
          <RecentActivity activities={recentActivities} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.filter(p => p.stock < 20).slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className={`rounded-lg border p-4 ${
                    item.stock < 5 ? 'border-destructive/50 bg-destructive/5' : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span className={`text-sm font-medium ${item.stock < 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                    <Link to="/farmer/products">Update Stock →</Link>
                  </Button>
                </div>
              ))}
              {products.filter(p => p.stock < 20).length === 0 && (
                <p className="text-muted-foreground">No low stock items</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
