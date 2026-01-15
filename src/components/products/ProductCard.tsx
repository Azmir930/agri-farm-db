import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
      <Link to={`/products/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2">
          {product.category}
        </Badge>
        <Link to={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-1 mt-2">
          <Star className="h-4 w-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-sm text-muted-foreground">
            ({product.reviewCount} reviews)
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          by {product.farmerName}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div>
          <span className="text-xl font-bold text-primary">₹{product.price}</span>
          <span className="text-sm text-muted-foreground">/{product.unit}</span>
        </div>
        <Button size="sm" onClick={() => addToCart(product)}>
          <ShoppingCart className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}
