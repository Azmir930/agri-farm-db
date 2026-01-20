import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Database } from '@/integrations/supabase/types';

type Review = Database['public']['Tables']['reviews']['Row'];

export interface ReviewWithUser extends Review {
  user_name?: string;
  user_avatar?: string | null;
  product?: {
    name: string;
    image_url: string | null;
  } | null;
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', productId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      // Fetch user profiles
      const userIds = [...new Set(data.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(
        profiles?.map(p => [
          p.user_id,
          {
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Anonymous',
            avatar: p.avatar_url,
          },
        ]) || []
      );

      return data.map(r => ({
        ...r,
        user_name: profileMap.get(r.user_id)?.name || 'Anonymous',
        user_avatar: profileMap.get(r.user_id)?.avatar || null,
      })) as ReviewWithUser[];
    },
    enabled: !!productId,
  });
}

export function useFarmerReviews() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['farmer-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get farmer's products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, image_url')
        .eq('farmer_id', user.id);

      if (!products?.length) return [];

      const productIds = products.map(p => p.id);
      const productMap = new Map(products.map(p => [p.id, p]));

      // Get reviews for these products
      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .in('product_id', productIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!reviews?.length) return [];

      // Fetch user profiles
      const userIds = [...new Set(reviews.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(
        profiles?.map(p => [
          p.user_id,
          {
            name: `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Anonymous',
            avatar: p.avatar_url,
          },
        ]) || []
      );

      return reviews.map(r => ({
        ...r,
        user_name: profileMap.get(r.user_id)?.name || 'Anonymous',
        user_avatar: profileMap.get(r.user_id)?.avatar || null,
        product: productMap.get(r.product_id) || null,
      })) as ReviewWithUser[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      rating,
      comment,
    }: {
      productId: string;
      rating: number;
      comment: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { productId }) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      queryClient.invalidateQueries({ queryKey: ['farmer-reviews'] });
    },
  });
}
