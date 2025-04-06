import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  Menu, 
  X
} from 'lucide-react';
import { Category } from '@/lib/types';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import CartDropdown from '@/components/cart/CartDropdown';

export default function Header() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      {/* Top announcement bar */}
      <div className="bg-primary text-white px-4 py-2 text-center text-sm font-medium">
        <p>Summer sale! Get up to 40% off on selected items. <Link href="/products?sale=true" className="underline">Shop now</Link></p>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo */}
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="flex items-center">
              <svg className="w-8 h-8 text-primary mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 8.5a1.5 1.5 0 0 0-1.5-1.5h-6.3l-1.7-5.1a1.5 1.5 0 0 0-2.9.1l-1.6 5H2a1.5 1.5 0 0 0 0 3h1.4l2 10A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1l2-10h0A1.5 1.5 0 0 0 22 8.5Z" />
              </svg>
              <span className="text-2xl font-bold text-gray-800">ShopEase</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mx-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-primary"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>
          </div>

          {/* Navigation icons */}
          <div className="flex items-center gap-4">
            {/* Wishlist icon */}
            <Link href="/wishlist" className="text-gray-500 hover:text-primary relative">
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart dropdown */}
            <div className="relative">
              <button 
                onClick={toggleCart}
                className="text-gray-500 hover:text-primary relative"
              >
                <ShoppingCart className="h-6 w-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {isCartOpen && <CartDropdown onClose={() => setIsCartOpen(false)} />}
            </div>

            {/* User dropdown */}
            <div className="relative">
              <button 
                onClick={toggleUserMenu}
                className="flex items-center focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <span className="ml-2 hidden md:block">My Account</span>
                <ChevronDown className="ml-1 h-4 w-4 hidden md:block" />
              </button>

              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Link href="/account/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    My Profile
                  </Link>
                  <Link href="/account/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    My Orders
                  </Link>
                  <Link href="/account/settings" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <div className="border-t my-1"></div>
                  <Link href="/auth/logout" className="block px-4 py-2 text-gray-700 hover:bg-gray-100">
                    Sign Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <nav className="mt-4 hidden md:flex">
          <ul className="flex space-x-6">
            {categoriesLoading ? (
              <li><span className="font-medium text-gray-400">Loading categories...</span></li>
            ) : (
              categories?.map((category: Category) => (
                <li key={category.id}>
                  <Link 
                    href={`/categories/${category.slug}`}
                    className="font-medium hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>

        {/* Mobile category menu button */}
        <div className="block md:hidden mt-4">
          <button 
            onClick={toggleMenu}
            className="flex items-center p-2 rounded border border-gray-300 w-full"
          >
            {isMenuOpen ? (
              <>
                <X className="h-5 w-5 mr-2" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Menu className="h-5 w-5 mr-2" />
                <span>Categories</span>
              </>
            )}
          </button>

          {isMenuOpen && (
            <div className="mt-2 bg-white rounded-lg shadow-lg p-4 z-40">
              <ul className="space-y-2">
                {categoriesLoading ? (
                  <li><span className="text-gray-400">Loading categories...</span></li>
                ) : (
                  categories?.map((category: Category) => (
                    <li key={category.id}>
                      <Link 
                        href={`/categories/${category.slug}`}
                        className="block py-1 hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
