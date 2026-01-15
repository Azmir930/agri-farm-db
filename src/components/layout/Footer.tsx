import { Link } from 'react-router-dom';
import { Leaf, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-8 w-8" />
              <span className="text-xl font-bold">AgriMarket</span>
            </Link>
            <p className="text-primary-foreground/80 mb-4">
              Connecting farmers directly with buyers. Fresh produce, fair prices.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-primary-foreground/80 hover:text-primary-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h3 className="font-semibold mb-4">For Users</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/register" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Become a Farmer
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Register as Buyer
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-primary-foreground/80 hover:text-primary-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-primary-foreground/80 hover:text-primary-foreground">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <MapPin className="h-4 w-4" />
                <span>123 Farm Road, Mumbai, India</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-primary-foreground/80">
                <Mail className="h-4 w-4" />
                <span>support@agrimarket.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} AgriMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
