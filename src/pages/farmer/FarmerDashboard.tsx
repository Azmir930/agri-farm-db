import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrdersTable, Order } from '@/components/dashboard/OrdersTable';
import { RecentActivity, Activity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, IndianRupee, Star, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'Rajesh Kumar',
    products: [{ name: 'Organic Tomatoes', quantity: 5 }, { name: 'Fresh Spinach', quantity: 2 }],
    total: 850,
    status: 'pending',
    date: '2024-01-15',
  },
  {
    id: '2',
    orderNumber: 'ORD-002',
    customerName: 'Priya Sharma',
    products: [{ name: 'Basmati Rice', quantity: 10 }],
    total: 1200,
    status: 'processing',
    date: '2024-01-14',
  },
  {
    id: '3',
    orderNumber: 'ORD-003',
    customerName: 'Amit Patel',
    products: [{ name: 'Fresh Mangoes', quantity: 3 }],
    total: 450,
    status: 'shipped',
    date: '2024-01-13',
  },
];

const mockActivities: Activity[] = [
  { id: '1', type: 'order', message: 'New order received from Rajesh Kumar', time: '2 minutes ago' },
  { id: '2', type: 'review', message: 'Priya left a 5-star review on Organic Tomatoes', time: '1 hour ago' },
  { id: '3', type: 'product', message: 'Low stock alert: Fresh Spinach (5 kg remaining)', time: '3 hours ago' },
  { id: '4', type: 'payment', message: 'Payment of ₹1,200 received for ORD-002', time: '5 hours ago' },
];

const FarmerDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
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

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value="24"
            icon={Package}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Pending Orders"
            value="8"
            icon={Truck}
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value="₹45,280"
            icon={IndianRupee}
            trend={{ value: 18, isPositive: true }}
          />
          <StatCard
            title="Avg. Rating"
            value="4.8"
            icon={Star}
            trend={{ value: 0.2, isPositive: true }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Orders Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/farmer/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={mockOrders.slice(0, 5)} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={mockActivities} />
        </div>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Fresh Spinach', stock: 5, unit: 'kg', status: 'low' },
                { name: 'Organic Carrots', stock: 12, unit: 'kg', status: 'medium' },
                { name: 'Red Onions', stock: 3, unit: 'kg', status: 'critical' },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`rounded-lg border p-4 ${
                    item.status === 'critical'
                      ? 'border-destructive/50 bg-destructive/5'
                      : item.status === 'low'
                      ? 'border-warning/50 bg-warning/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span
                      className={`text-sm font-medium ${
                        item.status === 'critical'
                          ? 'text-destructive'
                          : item.status === 'low'
                          ? 'text-warning'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                    <Link to="/farmer/inventory">Update Stock →</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;
