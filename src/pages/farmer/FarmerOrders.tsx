import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const orders = [
  { id: '1', orderNumber: 'ORD-001', customer: 'Rajesh Kumar', items: [{ name: 'Organic Tomatoes', qty: 5 }], total: 300, status: 'pending', date: '2024-01-15' },
  { id: '2', orderNumber: 'ORD-002', customer: 'Priya Sharma', items: [{ name: 'Fresh Mangoes', qty: 2 }], total: 300, status: 'processing', date: '2024-01-14' },
  { id: '3', orderNumber: 'ORD-003', customer: 'Amit Patel', items: [{ name: 'Green Apples', qty: 3 }], total: 540, status: 'shipped', date: '2024-01-13' },
];

const statusColors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800' };

const FarmerOrders = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  const handleStatusChange = (orderId: string, newStatus: string) => {
    toast({ title: 'Order updated', description: `Order status changed to ${newStatus}` });
  };

  const filtered = activeTab === 'all' ? orders : orders.filter((o) => o.status === activeTab);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Manage Orders</h1><p className="text-muted-foreground">{orders.length} total orders</p></div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="pending">Pending</TabsTrigger><TabsTrigger value="processing">Processing</TabsTrigger><TabsTrigger value="shipped">Shipped</TabsTrigger></TabsList>
          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {filtered.map((order) => (
              <Card key={order.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2"><h3 className="font-semibold">{order.orderNumber}</h3><Badge className={statusColors[order.status as keyof typeof statusColors]}>{order.status}</Badge></div>
                      <p className="text-sm text-muted-foreground">{order.customer} • {order.date}</p>
                      <p className="text-sm mt-1">{order.items.map((i) => `${i.name} (${i.qty})`).join(', ')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-bold">₹{order.total}</p>
                      <Select defaultValue={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="processing">Processing</SelectItem><SelectItem value="shipped">Shipped</SelectItem><SelectItem value="delivered">Delivered</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FarmerOrders;
