import React from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { mockProducts } from '@/data/mockProducts';

const farmerProducts = mockProducts.filter((p) => p.farmerId === 'f1');

const FarmerProducts = () => (
  <DashboardLayout>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Products</h1>
          <p className="text-muted-foreground">{farmerProducts.length} products listed</p>
        </div>
        <Button asChild className="gap-2"><Link to="/farmer/products/new"><Plus className="h-4 w-4" />Add Product</Link></Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {farmerProducts.map((product) => (
          <Card key={product.id}>
            <div className="aspect-video bg-muted"><img src="/placeholder.svg" alt={product.name} className="h-full w-full object-cover" /></div>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-primary font-bold">₹{product.price}/{product.unit}</p>
                </div>
                <Badge variant={product.stock > 10 ? 'default' : 'destructive'}>{product.stock} in stock</Badge>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1 gap-1" asChild><Link to={`/farmer/products/${product.id}/edit`}><Edit className="h-3 w-3" />Edit</Link></Button>
                <Button variant="outline" size="sm" className="text-destructive"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default FarmerProducts;
