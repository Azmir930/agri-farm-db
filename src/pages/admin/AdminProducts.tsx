import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye, Star, Ban, CheckCircle, Package, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  category: string;
  farmer: string;
  farmName: string;
  price: number;
  unit: string;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  rating: number;
  totalOrders: number;
  createdAt: string;
  image: string;
}

const mockProducts: Product[] = [
  { id: '1', name: 'Organic Tomatoes', category: 'Vegetables', farmer: 'John Farmer', farmName: 'Green Valley Farm', price: 4.99, unit: 'kg', stock: 150, isActive: true, isFeatured: true, rating: 4.8, totalOrders: 234, createdAt: '2024-01-15', image: '/placeholder.svg' },
  { id: '2', name: 'Fresh Apples', category: 'Fruits', farmer: 'Bob Smith', farmName: 'Sunrise Organics', price: 3.49, unit: 'kg', stock: 200, isActive: true, isFeatured: false, rating: 4.5, totalOrders: 189, createdAt: '2024-01-10', image: '/placeholder.svg' },
  { id: '3', name: 'Organic Honey', category: 'Dairy & Others', farmer: 'John Farmer', farmName: 'Green Valley Farm', price: 12.99, unit: 'jar', stock: 50, isActive: true, isFeatured: true, rating: 4.9, totalOrders: 156, createdAt: '2024-01-08', image: '/placeholder.svg' },
  { id: '4', name: 'Brown Rice', category: 'Grains', farmer: 'Mike Wilson', farmName: 'Happy Harvest', price: 6.99, unit: 'kg', stock: 0, isActive: false, isFeatured: false, rating: 4.2, totalOrders: 78, createdAt: '2024-01-05', image: '/placeholder.svg' },
  { id: '5', name: 'Fresh Carrots', category: 'Vegetables', farmer: 'Bob Smith', farmName: 'Sunrise Organics', price: 2.99, unit: 'kg', stock: 180, isActive: true, isFeatured: false, rating: 4.6, totalOrders: 145, createdAt: '2024-01-12', image: '/placeholder.svg' },
  { id: '6', name: 'Organic Eggs', category: 'Dairy & Others', farmer: 'Mike Wilson', farmName: 'Happy Harvest', price: 5.99, unit: 'dozen', stock: 75, isActive: true, isFeatured: true, rating: 4.7, totalOrders: 312, createdAt: '2024-01-18', image: '/placeholder.svg' },
];

const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.farmer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && product.isActive) || 
      (statusFilter === 'inactive' && !product.isActive) ||
      (statusFilter === 'featured' && product.isFeatured) ||
      (statusFilter === 'out-of-stock' && product.stock === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    featured: products.filter(p => p.isFeatured).length,
    outOfStock: products.filter(p => p.stock === 0).length,
  };

  const categories = [...new Set(products.map(p => p.category))];

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleToggleActive = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isActive: !p.isActive } : p
    ));
    const product = products.find(p => p.id === productId);
    toast({
      title: product?.isActive ? 'Product Deactivated' : 'Product Activated',
      description: `${product?.name} has been ${product?.isActive ? 'deactivated' : 'activated'}.`,
    });
  };

  const handleToggleFeatured = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
    ));
    const product = products.find(p => p.id === productId);
    toast({
      title: product?.isFeatured ? 'Removed from Featured' : 'Added to Featured',
      description: `${product?.name} has been ${product?.isFeatured ? 'removed from' : 'added to'} featured products.`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Product Moderation</h1>
          <p className="text-muted-foreground">Manage products, feature listings, and monitor inventory</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.featured}</p>
                <p className="text-sm text-muted-foreground">Featured</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.outOfStock}</p>
                <p className="text-sm text-muted-foreground">Out of Stock</p>
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
                  placeholder="Search products or farmers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-10 rounded object-cover bg-muted"
                        />
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.farmer}</p>
                        <p className="text-sm text-muted-foreground">{product.farmName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">${product.price.toFixed(2)}</span>
                      <span className="text-muted-foreground">/{product.unit}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={product.stock > 0 ? 'outline' : 'destructive'}>
                        {product.stock > 0 ? `${product.stock} ${product.unit}` : 'Out of Stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{product.rating}</span>
                        <span className="text-muted-foreground">({product.totalOrders})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={product.isActive ? 'default' : 'secondary'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleViewProduct(product)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleFeatured(product.id)}
                          className={product.isFeatured ? 'text-yellow-600' : ''}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleToggleActive(product.id)}
                          className={product.isActive ? 'text-destructive hover:text-destructive' : 'text-green-600 hover:text-green-600'}
                        >
                          {product.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View Product Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
            </DialogHeader>
            {selectedProduct && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-24 h-24 rounded-lg object-cover bg-muted"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                    <p className="text-muted-foreground">{selectedProduct.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedProduct.rating}</span>
                      <span className="text-muted-foreground">({selectedProduct.totalOrders} orders)</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Farmer</p>
                    <p className="font-medium">{selectedProduct.farmer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Farm</p>
                    <p className="font-medium">{selectedProduct.farmName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">${selectedProduct.price.toFixed(2)} / {selectedProduct.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Stock</p>
                    <p className="font-medium">{selectedProduct.stock} {selectedProduct.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {selectedProduct.isFeatured && (
                        <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Listed On</p>
                    <p className="font-medium">{selectedProduct.createdAt}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
