import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { OrdersTable, Order } from '@/components/dashboard/OrdersTable';
import { RecentActivity, Activity } from '@/components/dashboard/RecentActivity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Package, Truck, IndianRupee, TrendingUp, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data
const revenueData = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 67000 },
];

const userDistribution = [
  { name: 'Farmers', value: 245, color: 'hsl(142, 50%, 35%)' },
  { name: 'Buyers', value: 1820, color: 'hsl(45, 85%, 55%)' },
  { name: 'Admins', value: 12, color: 'hsl(200, 85%, 45%)' },
];

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-001',
    customerName: 'Rajesh Kumar',
    products: [{ name: 'Organic Tomatoes', quantity: 5 }],
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
    status: 'delivered',
    date: '2024-01-13',
  },
];

const mockActivities: Activity[] = [
  { id: '1', type: 'user', message: 'New farmer registered: Green Valley Farm', time: '5 minutes ago' },
  { id: '2', type: 'payment', message: 'Payment dispute raised for ORD-089', time: '1 hour ago' },
  { id: '3', type: 'product', message: '15 products pending approval', time: '2 hours ago' },
  { id: '4', type: 'order', message: 'Order volume increased by 25% today', time: '3 hours ago' },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">System overview and management</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/admin/users">Manage Users</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/analytics">View Analytics</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value="2,077"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Products"
            value="856"
            icon={Package}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Orders"
            value="3,421"
            icon={Truck}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Revenue (MTD)"
            value="₹6.7L"
            icon={IndianRupee}
            trend={{ value: 22, isPositive: true }}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 50%, 35%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(142, 50%, 35%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `₹${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(142, 50%, 35%)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-4">
                {userDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Orders</CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/admin/orders">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <OrdersTable orders={mockOrders} />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <RecentActivity activities={mockActivities} />
        </div>

        {/* Alerts Section */}
        <Card className="border-warning/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { title: 'Pending KYC Verifications', count: 8, action: 'Review' },
                { title: 'Products Awaiting Approval', count: 15, action: 'Approve' },
                { title: 'Unresolved Payment Disputes', count: 3, action: 'Resolve' },
              ].map((alert) => (
                <div key={alert.title} className="rounded-lg border border-warning/30 bg-warning/5 p-4">
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-2xl font-bold text-warning">{alert.count}</p>
                  <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                    {alert.action} →
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

export default AdminDashboard;
