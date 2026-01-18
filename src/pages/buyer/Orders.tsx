import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronRight,
  MapPin,
  Star,
} from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  deliveryAddress: string;
  estimatedDelivery?: string;
  trackingId?: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-045678',
    date: '2024-01-15',
    status: 'shipped',
    items: [
      { id: '1', name: 'Organic Tomatoes', quantity: 5, unit: 'kg', price: 60 },
      { id: '2', name: 'Fresh Spinach', quantity: 2, unit: 'bunch', price: 40 },
    ],
    total: 380,
    deliveryAddress: '123 Farm Lane, Green Valley, Mumbai',
    estimatedDelivery: '2024-01-18',
    trackingId: 'TRK123456',
  },
  {
    id: '2',
    orderNumber: 'ORD-045632',
    date: '2024-01-12',
    status: 'delivered',
    items: [
      { id: '3', name: 'Basmati Rice', quantity: 10, unit: 'kg', price: 120 },
    ],
    total: 1200,
    deliveryAddress: '123 Farm Lane, Green Valley, Mumbai',
  },
  {
    id: '3',
    orderNumber: 'ORD-045598',
    date: '2024-01-10',
    status: 'pending',
    items: [
      { id: '4', name: 'Fresh Mangoes', quantity: 2, unit: 'dozen', price: 150 },
      { id: '5', name: 'Green Apples', quantity: 3, unit: 'kg', price: 180 },
    ],
    total: 840,
    deliveryAddress: '123 Farm Lane, Green Valley, Mumbai',
  },
  {
    id: '4',
    orderNumber: 'ORD-045501',
    date: '2024-01-05',
    status: 'cancelled',
    items: [
      { id: '6', name: 'Fresh Milk', quantity: 5, unit: 'litre', price: 55 },
    ],
    total: 275,
    deliveryAddress: '123 Farm Lane, Green Valley, Mumbai',
  },
];

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-800' },
  processing: { label: 'Processing', icon: Package, color: 'bg-blue-100 text-blue-800' },
  shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
};

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredOrders = mockOrders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && ['pending', 'processing', 'shipped'].includes(order.status)) ||
      (activeTab === 'completed' && order.status === 'delivered') ||
      (activeTab === 'cancelled' && order.status === 'cancelled');

    return matchesSearch && matchesTab;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredOrders.length === 0 ? (
              <Card className="py-12">
                <CardContent className="text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? 'Try a different search term'
                      : "You haven't placed any orders yet"}
                  </p>
                  <Button asChild>
                    <Link to="/buyer/products">Start Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const StatusIcon = statusConfig[order.status].icon;
                  return (
                    <Card key={order.id}>
                      <CardContent className="pt-6">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{order.orderNumber}</h3>
                              <Badge className={statusConfig[order.status].color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig[order.status].label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Placed on {new Date(order.date).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{order.total}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 min-w-fit border rounded-lg p-2"
                            >
                              <div className="h-12 w-12 bg-muted rounded flex-shrink-0">
                                <img
                                  src={item.image || '/placeholder.svg'}
                                  alt={item.name}
                                  className="h-full w-full object-cover rounded"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} {item.unit} × ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Info */}
                        {order.status === 'shipped' && (
                          <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                            <div className="flex items-center gap-2 text-sm">
                              <Truck className="h-4 w-4 text-primary" />
                              <span>
                                Expected delivery by{' '}
                                <strong>
                                  {new Date(order.estimatedDelivery!).toLocaleDateString('en-IN', {
                                    day: 'numeric',
                                    month: 'long',
                                  })}
                                </strong>
                              </span>
                            </div>
                            {order.trackingId && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Tracking ID: {order.trackingId}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Delivery Address */}
                        <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/buyer/orders/${order.id}`}>
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                          </Button>
                          {order.status === 'delivered' && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Star className="h-4 w-4" />
                              Rate Order
                            </Button>
                          )}
                          {order.status === 'delivered' && (
                            <Button variant="outline" size="sm">
                              Reorder
                            </Button>
                          )}
                          {order.status === 'pending' && (
                            <Button variant="outline" size="sm" className="text-destructive">
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Orders;
