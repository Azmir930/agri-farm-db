import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type ProductInsert = Database['public']['Tables']['products']['Insert'];
type ProductUpdate = Database['public']['Tables']['products']['Update'];
type Category = Database['public']['Tables']['categories']['Row'];

export interface ProductWithDetails extends Product {
  categories?: Category | null;
  farmer_name?: string;
}

export function useProducts(filters?: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  farmerId?: string;
}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .eq('is_active', true)
        .eq('is_approved', true);

      if (filters?.category) {
        query = query.eq('category_id', filters.category);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters?.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.inStock) {
        query = query.gt('stock', 0);
      }
      if (filters?.farmerId) {
        query = query.eq('farmer_id', filters.farmerId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      // Fetch farmer names separately
      const products = data || [];
      const farmerIds = [...new Set(products.map(p => p.farmer_id))];
      
      if (farmerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name')
          .in('user_id', farmerIds);

        const profileMap = new Map(
          profiles?.map(p => [p.user_id, `${p.first_name || ''} ${p.last_name || ''}`.trim()]) || []
        );

        return products.map(p => ({
          ...p,
          farmer_name: profileMap.get(p.farmer_id) || 'Unknown Farmer',
        })) as ProductWithDetails[];
      }

      return products as ProductWithDetails[];
    },
  });
}

export function useProduct(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;

      // Fetch farmer name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', data.farmer_id)
        .maybeSingle();

      return {
        ...data,
        farmer_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown Farmer',
      } as ProductWithDetails;
    },
    enabled: !!id,
  });
}

export function useFarmerProducts(farmerId: string | undefined) {
  return useQuery({
    queryKey: ['farmer-products', farmerId],
    queryFn: async () => {
      if (!farmerId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories(*)
        `)
        .eq('farmer_id', farmerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProductWithDetails[];
    },
    enabled: !!farmerId,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProductUpdate }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      queryClient.invalidateQueries({ queryKey: ['farmer-products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['farmer-products'] });
    },
  });
}
