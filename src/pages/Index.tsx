import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Truck, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { mockProducts, mockCategories } from '@/lib/mock-data';

const Index = () => {
  const featuredProducts = mockProducts.slice(0, 4);

  const features = [
    {
      icon: Leaf,
      title: 'Fresh & Organic',
      description: 'Directly sourced from farms, ensuring freshness and quality.',
    },
    {
      icon: Users,
      title: 'Support Farmers',
      description: 'Fair prices for farmers, eliminating middlemen.',
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery to your doorstep.',
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and secure payment options for peace of mind.',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-accent/10 py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Farm Fresh Products,
              <span className="text-primary"> Delivered to You</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect directly with local farmers and get fresh, organic produce at fair prices. 
              Supporting sustainable agriculture, one purchase at a time.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/products">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/register">Become a Farmer</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground">Browse our wide range of farm-fresh products</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockCategories.map(category => (
              <Link key={category.id} to={`/products?category=${category.name}`}>
                <Card className="hover:shadow-md hover:border-primary/50 transition-all cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <span className="text-4xl mb-3 block">{category.icon}</span>
                    <h3 className="font-semibold">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">Top picks from our farms</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">View All</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/50">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Why Choose AgriMarket?</h2>
            <p className="text-muted-foreground">We're committed to quality and sustainability</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Selling?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of farmers already using AgriMarket to reach customers directly.
            No middlemen, fair prices, and a platform built for you.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/register">
              Register as Farmer
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
