import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Search, Eye, Truck, Package, Clock, CheckCircle, XCircle, ShoppingCart, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  buyer: string;
  buyerEmail: string;
  farmer: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  deliveryAddress: string;
  trackingNumber?: string;
  carrier?: string;
  createdAt: string;
  estimatedDelivery?: string;
}

const mockOrders: Order[] = [
  { 
    id: '1', orderNumber: 'ORD-001234', buyer: 'Jane Buyer', buyerEmail: 'jane@email.com', farmer: 'John Farmer',
    items: [{ id: '1', productName: 'Organic Tomatoes', quantity: 5, unit: 'kg', price: 24.95 }, { id: '2', productName: 'Fresh Carrots', quantity: 3, unit: 'kg', price: 8.97 }],
    total: 33.92, status: 'shipped', paymentStatus: 'completed', deliveryAddress: '123 Main St, City, State 12345',
    trackingNumber: 'TRK123456789', carrier: 'FedEx', createdAt: '2024-01-20', estimatedDelivery: '2024-01-25'
  },
  { 
    id: '2', orderNumber: 'ORD-001235', buyer: 'Alice Johnson', buyerEmail: 'alice@email.com', farmer: 'Bob Smith',
    items: [{ id: '1', productName: 'Fresh Apples', quantity: 10, unit: 'kg', price: 34.90 }],
    total: 34.90, status: 'pending', paymentStatus: 'pending', deliveryAddress: '456 Oak Ave, Town, State 54321',
    createdAt: '2024-01-21'
  },
  { 
    id: '3', orderNumber: 'ORD-001236', buyer: 'Jane Buyer', buyerEmail: 'jane@email.com', farmer: 'Mike Wilson',
    items: [{ id: '1', productName: 'Organic Eggs', quantity: 2, unit: 'dozen', price: 11.98 }, { id: '2', productName: 'Brown Rice', quantity: 5, unit: 'kg', price: 34.95 }],
    total: 46.93, status: 'delivered', paymentStatus: 'completed', deliveryAddress: '123 Main St, City, State 12345',
    trackingNumber: 'TRK987654321', carrier: 'UPS', createdAt: '2024-01-15', estimatedDelivery: '2024-01-20'
  },
  { 
    id: '4', orderNumber: 'ORD-001237', buyer: 'Bob Test', buyerEmail: 'bob@test.com', farmer: 'John Farmer',
    items: [{ id: '1', productName: 'Organic Honey', quantity: 3, unit: 'jar', price: 38.97 }],
    total: 38.97, status: 'cancelled', paymentStatus: 'refunded', deliveryAddress: '789 Pine Rd, Village, State 67890',
    createdAt: '2024-01-18'
  },
  { 
    id: '5', orderNumber: 'ORD-001238', buyer: 'Mary Smith', buyerEmail: 'mary@email.com', farmer: 'Bob Smith',
    items: [{ id: '1', productName: 'Fresh Carrots', quantity: 4, unit: 'kg', price: 11.96 }],
    total: 11.96, status: 'processing', paymentStatus: 'completed', deliveryAddress: '321 Elm St, Metro, State 11223',
    createdAt: '2024-01-22'
  },
];

const statusColors: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [updateForm, setUpdateForm] = useState({ status: '', trackingNumber: '', carrier: '', estimatedDelivery: '' });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    inProgress: orders.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.filter(o => o.paymentStatus === 'completed').reduce((sum, o) => sum + o.total, 0),
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewDialogOpen(true);
  };

  const handleUpdateClick = (order: Order) => {
    setSelectedOrder(order);
    setUpdateForm({
      status: order.status,
      trackingNumber: order.trackingNumber || '',
      carrier: order.carrier || '',
      estimatedDelivery: order.estimatedDelivery || '',
    });
    setIsUpdateDialogOpen(true);
  };

  const handleUpdateOrder = () => {
    if (selectedOrder) {
      setOrders(orders.map(o => 
        o.id === selectedOrder.id 
          ? { 
              ...o, 
              status: updateForm.status as Order['status'],
              trackingNumber: updateForm.trackingNumber || undefined,
              carrier: updateForm.carrier || undefined,
              estimatedDelivery: updateForm.estimatedDelivery || undefined,
            } 
          : o
      ));
      toast({
        title: 'Order Updated',
        description: `Order ${selectedOrder.orderNumber} has been updated.`,
      });
      setIsUpdateDialogOpen(false);
    }
  };

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Refunded</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Monitor and manage all marketplace orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders, buyers, or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.items.length} item(s)</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.buyer}</p>
                      <p className="text-sm text-muted-foreground">{order.buyerEmail}</p>
                    </TableCell>
                    <TableCell>{order.farmer}</TableCell>
                    <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[order.status]} hover:${statusColors[order.status]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                    <TableCell className="text-muted-foreground">{order.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleUpdateClick(order)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                        >
                          <Truck className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Order Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Buyer</p>
                    <p className="font-medium">{selectedOrder.buyer}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.buyerEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Farmer</p>
                    <p className="font-medium">{selectedOrder.farmer}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2 bg-muted/50 p-3 rounded-lg">
                    {selectedOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.productName} × {item.quantity} {item.unit}</span>
                        <span className="font-medium">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Order Status</p>
                    <Badge className={`${statusColors[selectedOrder.status]} mt-1`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    <div className="mt-1">{getPaymentBadge(selectedOrder.paymentStatus)}</div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Delivery Address</p>
                  <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                </div>

                {selectedOrder.trackingNumber && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Tracking Number</p>
                      <p className="font-medium">{selectedOrder.trackingNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="font-medium">{selectedOrder.carrier}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Order Dialog */}
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order - {selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Order Status</Label>
                <Select value={updateForm.status} onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tracking Number</Label>
                <Input 
                  value={updateForm.trackingNumber}
                  onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })}
                  placeholder="Enter tracking number"
                />
              </div>
              <div>
                <Label>Carrier</Label>
                <Select value={updateForm.carrier} onValueChange={(value) => setUpdateForm({ ...updateForm, carrier: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FedEx">FedEx</SelectItem>
                    <SelectItem value="UPS">UPS</SelectItem>
                    <SelectItem value="USPS">USPS</SelectItem>
                    <SelectItem value="DHL">DHL</SelectItem>
                    <SelectItem value="Local Delivery">Local Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estimated Delivery</Label>
                <Input 
                  type="date"
                  value={updateForm.estimatedDelivery}
                  onChange={(e) => setUpdateForm({ ...updateForm, estimatedDelivery: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateOrder}>Update Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminOrders;
