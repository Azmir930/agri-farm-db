import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Loader2,
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

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
  const { data: orders = [], isLoading } = useOrders();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase());

    const status = order.status as OrderStatus;
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'active' && ['pending', 'processing', 'shipped'].includes(status)) ||
      (activeTab === 'completed' && status === 'delivered') ||
      (activeTab === 'cancelled' && status === 'cancelled');

    return matchesSearch && matchesTab;
  });

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
                  const status = (order.status as OrderStatus) || 'pending';
                  const StatusIcon = statusConfig[status]?.icon || Clock;
                  const statusColor = statusConfig[status]?.color || 'bg-gray-100 text-gray-800';
                  const statusLabel = statusConfig[status]?.label || order.status;

                  return (
                    <Card key={order.id}>
                      <CardContent className="pt-6">
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="font-semibold">{order.order_number}</h3>
                              <Badge className={statusColor}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusLabel}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">₹{Number(order.total_amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.order_items?.length || 0} items
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {order.order_items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 min-w-fit border rounded-lg p-2"
                            >
                              <div className="h-12 w-12 bg-muted rounded flex-shrink-0">
                                <img
                                  src="/placeholder.svg"
                                  alt={item.product_name}
                                  className="h-full w-full object-cover rounded"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.quantity} × ₹{Number(item.unit_price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Address */}
                        {order.delivery_address && (
                          <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span>
                              {order.delivery_address}, {order.delivery_city}, {order.delivery_state}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                          {status === 'delivered' && (
                            <Button variant="outline" size="sm" className="gap-1">
                              <Star className="h-4 w-4" />
                              Rate Order
                            </Button>
                          )}
                          {status === 'delivered' && (
                            <Button variant="outline" size="sm">
                              Reorder
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
