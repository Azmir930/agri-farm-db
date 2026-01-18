import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, MessageSquare } from 'lucide-react';

const reviews = [
  { id: '1', product: 'Organic Tomatoes', customer: 'Priya S.', rating: 5, comment: 'Excellent quality! Very fresh.', date: '2024-01-10' },
  { id: '2', product: 'Fresh Mangoes', customer: 'Amit P.', rating: 4, comment: 'Good taste, slightly expensive.', date: '2024-01-08' },
  { id: '3', product: 'Green Apples', customer: 'Sunita D.', rating: 5, comment: 'Love these apples! Will order again.', date: '2024-01-05' },
];

const FarmerReviews = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Customer Reviews</h1><p className="text-muted-foreground">{reviews.length} reviews on your products</p></div>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold text-primary">4.7</div><div className="flex justify-center mt-1">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}</div><p className="text-sm text-muted-foreground mt-1">Average Rating</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold">{reviews.length}</div><p className="text-sm text-muted-foreground">Total Reviews</p></CardContent></Card>
        <Card><CardContent className="pt-6 text-center"><div className="text-3xl font-bold text-primary">85%</div><p className="text-sm text-muted-foreground">5-Star Reviews</p></CardContent></Card>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar><AvatarFallback>{review.customer.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div><p className="font-medium">{review.customer}</p><p className="text-sm text-muted-foreground">on {review.product}</p></div>
                    <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}</div>
                  </div>
                  <p className="mt-2 text-muted-foreground">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default FarmerReviews;
