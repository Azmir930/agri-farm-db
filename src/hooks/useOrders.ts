import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];
type Payment = Database['public']['Tables']['payments']['Row'];

export interface OrderItemWithProduct extends OrderItem {
  product_image?: string | null;
}

export interface OrderWithItems extends Order {
  order_items: OrderItemWithProduct[];
  payments?: Payment[];
}

export function useOrders() {
  const { user, role } = useAuth();

  return useQuery({
    queryKey: ['orders', user?.id, role],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (role !== 'admin') {
        query = query.eq('buyer_id', user.id);
      }

      const { data: orders, error } = await query;
      if (error) throw error;
      if (!orders?.length) return [];

      const orderIds = orders.map(o => o.id);
      
      const [itemsResult, paymentsResult] = await Promise.all([
        supabase.from('order_items').select('*').in('order_id', orderIds),
        supabase.from('payments').select('*').in('order_id', orderIds),
      ]);

      const itemsByOrder = new Map<string, OrderItemWithProduct[]>();
      itemsResult.data?.forEach(item => {
        const items = itemsByOrder.get(item.order_id) || [];
        items.push(item);
        itemsByOrder.set(item.order_id, items);
      });

      const paymentsByOrder = new Map<string, Payment[]>();
      paymentsResult.data?.forEach(payment => {
        const payments = paymentsByOrder.get(payment.order_id) || [];
        payments.push(payment);
        paymentsByOrder.set(payment.order_id, payments);
      });

      return orders.map(order => ({
        ...order,
        order_items: itemsByOrder.get(order.id) || [],
        payments: paymentsByOrder.get(order.id) || [],
      })) as OrderWithItems[];
    },
    enabled: !!user?.id,
  });
}

export function useFarmerOrders() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['farmer-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('farmer_id', user.id);

      if (itemsError) throw itemsError;
      if (!orderItems?.length) return [];

      const orderIds = [...new Set(orderItems.map(i => i.order_id))];

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .in('id', orderIds);

      const orderMap = new Map<string, OrderWithItems>();
      orders?.forEach(order => {
        orderMap.set(order.id, { ...order, order_items: [] });
      });

      orderItems.forEach(item => {
        const order = orderMap.get(item.order_id);
        if (order) order.order_items.push(item);
      });

      return Array.from(orderMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: !!user?.id,
  });
}

export function useOrder(id: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!id || !user?.id) return null;

      const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!order) return null;

      const [itemsResult, paymentsResult] = await Promise.all([
        supabase.from('order_items').select('*').eq('order_id', id),
        supabase.from('payments').select('*').eq('order_id', id),
      ]);

      return {
        ...order,
        order_items: itemsResult.data || [],
        payments: paymentsResult.data || [],
      } as OrderWithItems;
    },
    enabled: !!id && !!user?.id,
  });
}

export function useCreateOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: {
      items: Array<{
        productId: string;
        productName: string;
        farmerId: string;
        quantity: number;
        unitPrice: number;
      }>;
      deliveryAddress: string;
      deliveryCity: string;
      deliveryState: string;
      deliveryFee: number;
      paymentMethod: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const subtotal = orderData.items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity, 0
      );
      const totalAmount = subtotal + orderData.deliveryFee;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          subtotal,
          delivery_fee: orderData.deliveryFee,
          total_amount: totalAmount,
          delivery_address: orderData.deliveryAddress,
          delivery_city: orderData.deliveryCity,
          delivery_state: orderData.deliveryState,
          notes: orderData.notes,
          status: 'pending',
          order_number: '', // Will be set by trigger
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        farmer_id: item.farmerId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
      }));

      await supabase.from('order_items').insert(orderItems);

      await supabase.from('payments').insert([{
        order_id: order.id,
        amount: totalAmount,
        payment_method: orderData.paymentMethod as 'card' | 'bank_transfer' | 'mobile_money' | 'cash_on_delivery',
        status: 'pending',
      }]);

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-orders'] });
    },
  });
}
