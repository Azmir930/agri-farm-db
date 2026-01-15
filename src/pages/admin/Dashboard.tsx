import { Link } from 'react-router-dom';
import { 
  Users, Package, ShoppingCart, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight,
  BarChart3, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardStats, mockOrders, mockUsers } from '@/lib/mock-data';

export default function AdminDashboard() {
  const { user } = useAuth();
  const recentOrders = mockOrders.slice(0, 5);

  const stats = [
    { 
      icon: Users, 
      label: 'Total Users', 
      value: mockDashboardStats.totalUsers.toLocaleString(),
      change: '+12%',
      isPositive: true,
      color: 'text-primary'
    },
    { 
      icon: Package, 
      label: 'Active Products', 
      value: mockDashboardStats.activeProducts.toLocaleString(),
      change: '+8%',
      isPositive: true,
      color: 'text-success'
    },
    { 
      icon: ShoppingCart, 
      label: 'Total Orders', 
      value: mockDashboardStats.totalOrders.toLocaleString(),
      change: '+23%',
      isPositive: true,
      color: 'text-info'
    },
    { 
      icon: DollarSign, 
      label: 'Revenue', 
      value: `₹${(mockDashboardStats.totalRevenue / 1000).toFixed(0)}K`,
      change: '+18%',
      isPositive: true,
      color: 'text-accent'
    },
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
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.firstName || 'Admin'}! Here's your platform overview.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-10 w-10 rounded-lg bg-muted flex items-center justify-center`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div className={`flex items-center text-sm ${stat.isPositive ? 'text-success' : 'text-destructive'}`}>
                    {stat.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {stat.change}
                  </div>
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/users">
              <Users className="h-5 w-5 mr-2" />
              Manage Users
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/products">
              <Package className="h-5 w-5 mr-2" />
              Manage Products
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/orders">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Manage Orders
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4">
            <Link to="/admin/analytics">
              <BarChart3 className="h-5 w-5 mr-2" />
              View Analytics
            </Link>
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/orders">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentOrders.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">#{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.createdAt}</p>
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

          {/* Recent Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Users
              </CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/users">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">
                          {u.firstName[0]}{u.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-sm text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{u.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Pending Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-2xl font-bold text-warning">{mockDashboardStats.pendingOrders}</p>
                <p className="text-sm text-muted-foreground">Pending Orders</p>
              </div>
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-2xl font-bold text-info">8</p>
                <p className="text-sm text-muted-foreground">KYC Verifications</p>
              </div>
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-2xl font-bold text-destructive">3</p>
                <p className="text-sm text-muted-foreground">Reported Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
