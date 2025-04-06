import React, { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/types';
import { 
  formatCurrency, 
  calculateDiscountPercentage, 
  getStarRating 
} from '@/lib/utils';
import { useCart } from '@/lib/context/CartContext';
import { useWishlist } from '@/lib/context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Star, 
  AlertTriangle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ProductDetails() {
  const [location, setLocation] = useLocation();
  const params = useParams<{ slug: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('red');
  const [selectedSize, setSelectedSize] = useState('9');
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  // Fetch product by slug
  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery<Product>({
    queryKey: [`/api/products/slug/${params.slug}`],
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/2 animate-pulse">
            <div className="bg-gray-200 h-[500px] rounded-lg mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="h-10 bg-gray-200 rounded w-full mb-8"></div>
            <div className="h-24 bg-gray-200 rounded w-full mb-8"></div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold mt-4 mb-2">Product Not Found</h1>
        <p className="text-gray-600 mb-6">The product you're looking for could not be found or has been removed.</p>
        <Button onClick={() => setLocation('/products')}>
          Continue Shopping
        </Button>
      </div>
    );
  }
  
  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ id: 0, productId: product.id, url: product.featuredImage, alt: product.name }];
  
  const { full, half, empty } = getStarRating(product.rating || 0);
  const discountPercentage = calculateDiscountPercentage(product.price, product.compareAtPrice);
  const inWishlist = isInWishlist(product.id);
  
  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= product.stock) {
      setQuantity(value);
    }
  };
  
  const handleAddToCart = () => {
    addToCart(product, quantity);
  };
  
  const handleAddToWishlist = () => {
    addToWishlist(product);
  };
  
  // Sample color options (would come from product variants in a real app)
  const colorOptions = [
    { id: 'red', name: 'Red', bgClass: 'bg-red-500' },
    { id: 'blue', name: 'Blue', bgClass: 'bg-blue-500' },
    { id: 'black', name: 'Black', bgClass: 'bg-black' },
    { id: 'gray', name: 'Gray', bgClass: 'bg-gray-200' },
  ];
  
  // Sample size options (would come from product variants in a real app)
  const sizeOptions = ['7', '8', '9', '10', '11'];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Images */}
          <div className="lg:w-1/2">
            <div className="relative mb-4 rounded-lg overflow-hidden">
              <img 
                src={images[selectedImage].url} 
                alt={images[selectedImage].alt || product.name} 
                className="w-full h-[500px] object-cover"
              />
              {product.isSale && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive">
                    {discountPercentage ? `${discountPercentage}% OFF` : 'SALE'}
                  </Badge>
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 left-4">
                  <Badge variant="default" className="bg-green-500">NEW</Badge>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div 
                  key={image.id} 
                  className={`border-2 ${selectedImage === index ? 'border-primary' : 'border-gray-200'} rounded-lg overflow-hidden cursor-pointer`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image.url} 
                    alt={image.alt || `${product.name} - ${index + 1}`} 
                    className="w-full h-24 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="lg:w-1/2">
            <div className="mb-2 flex items-center">
              <div className="flex text-yellow-400">
                {[...Array(full)].map((_, i) => (
                  <Star key={`star-full-${i}`} className="h-5 w-5 fill-current" />
                ))}
                {[...Array(half)].map((_, i) => (
                  <Star key={`star-half-${i}`} className="h-5 w-5 fill-current stroke-yellow-400" />
                ))}
                {[...Array(empty)].map((_, i) => (
                  <Star key={`star-empty-${i}`} className="h-5 w-5 text-gray-300" />
                ))}
              </div>
              <span className="text-gray-500 text-sm ml-2">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-500 mb-4">
              SKU: {product.sku} | Brand: {product.brand}
            </p>
            
            <div className="flex items-center mb-6">
              <span className="text-3xl font-bold text-gray-800">
                {formatCurrency(product.price)}
              </span>
              
              {product.compareAtPrice && (
                <span className="text-xl text-gray-500 line-through ml-3">
                  {formatCurrency(product.compareAtPrice)}
                </span>
              )}
              
              {discountPercentage && (
                <span className="ml-3 bg-secondary/10 text-secondary px-2 py-1 rounded-md text-sm font-medium">
                  {discountPercentage}% OFF
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-6">
              {product.description}
            </p>
            
            {/* Color options */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Color:</h3>
              <div className="flex space-x-3">
                {colorOptions.map((color) => (
                  <button 
                    key={color.id}
                    className={`w-8 h-8 ${color.bgClass} rounded-full border-2 border-white ${selectedColor === color.id ? 'outline outline-2 outline-primary' : ''}`}
                    onClick={() => setSelectedColor(color.id)}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
            
            {/* Size options */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Size:</h3>
              <div className="grid grid-cols-5 gap-2">
                {sizeOptions.map((size) => (
                  <button 
                    key={size}
                    className={`py-2 ${selectedSize === size ? 'bg-primary text-white' : 'border border-gray-300 text-gray-500'} rounded font-medium`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Quantity:</h3>
              <div className="flex w-[140px] border border-gray-300 rounded-lg overflow-hidden">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-none h-full w-10"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <input 
                  type="number" 
                  value={quantity} 
                  min="1" 
                  max={product.stock}
                  className="w-full py-2 text-center focus:outline-none"
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                />
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-none h-full w-10"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Only {product.stock} items left in stock
              </p>
            </div>
            
            {/* Add to cart and other actions */}
            <div className="flex flex-col space-y-3">
              <Button 
                className="flex items-center justify-center"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className={`flex items-center justify-center ${inWishlist ? 'text-red-500 border-red-500' : ''}`}
                  onClick={handleAddToWishlist}
                >
                  <Heart className={`h-5 w-5 mr-2 ${inWishlist ? 'fill-current' : ''}`} />
                  {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center justify-center"
                  onClick={() => {
                    // In a real app, this would open a share dialog
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
            
            {/* Product details tabs */}
            <div className="mt-8 border-t pt-6">
              <div className="flex border-b">
                <button 
                  onClick={() => setActiveTab('description')} 
                  className={`py-2 px-4 font-medium ${activeTab === 'description' ? 'border-b-2 border-primary text-primary' : ''}`}
                >
                  Description
                </button>
                <button 
                  onClick={() => setActiveTab('details')} 
                  className={`py-2 px-4 font-medium ${activeTab === 'details' ? 'border-b-2 border-primary text-primary' : ''}`}
                >
                  Details
                </button>
                <button 
                  onClick={() => setActiveTab('reviews')} 
                  className={`py-2 px-4 font-medium ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : ''}`}
                >
                  Reviews ({product.reviewCount})
                </button>
              </div>
              
              <div className="pt-4">
                {activeTab === 'description' && (
                  <div className="text-gray-600">
                    <p>{product.description}</p>
                    <p className="mt-2">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in velit vel justo ultrices ultricies. 
                      Proin faucibus urna vel odio facilisis, sit amet dictum justo finibus. Sed varius, metus in feugiat cursus, 
                      velit massa euismod ante, at tempor enim tellus non turpis.
                    </p>
                  </div>
                )}
                
                {activeTab === 'details' && (
                  <div className="text-gray-600">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Brand: {product.brand}</li>
                      <li>SKU: {product.sku}</li>
                      <li>Available Stock: {product.stock}</li>
                      <li>Category: {product.category?.name || 'N/A'}</li>
                      {product.isSale && <li>On Sale: Yes</li>}
                      {product.isNew && <li>New Arrival: Yes</li>}
                      <li>Rating: {product.rating} ({product.reviewCount} reviews)</li>
                    </ul>
                  </div>
                )}
                
                {activeTab === 'reviews' && (
                  <div className="text-gray-600">
                    {product.reviewCount > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Reviewer" className="w-10 h-10 rounded-full mr-3" />
                              <div>
                                <h4 className="font-medium text-gray-800">John D.</h4>
                                <p className="text-xs text-gray-500">Verified Purchase</p>
                              </div>
                            </div>
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p>
                            Absolutely love this product! It is incredibly well-made and looks great. 
                            I've gotten so many compliments on it. Worth every penny.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Posted on: May 12, 2023</p>
                        </div>
                        
                        <div className="p-4 rounded-lg bg-gray-50">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <img src="https://randomuser.me/api/portraits/women/54.jpg" alt="Reviewer" className="w-10 h-10 rounded-full mr-3" />
                              <div>
                                <h4 className="font-medium text-gray-800">Emily S.</h4>
                                <p className="text-xs text-gray-500">Verified Purchase</p>
                              </div>
                            </div>
                            <div className="flex text-yellow-400">
                              {[...Array(4)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 fill-current" />
                              ))}
                              {[...Array(1)].map((_, i) => (
                                <Star key={i} className="h-4 w-4 text-gray-300" />
                              ))}
                            </div>
                          </div>
                          <p>
                            Great product, but it arrived a bit later than expected. 
                            Otherwise, very satisfied with my purchase and would recommend.
                          </p>
                          <p className="text-xs text-gray-500 mt-2">Posted on: April 28, 2023</p>
                        </div>
                      </div>
                    ) : (
                      <p>No reviews yet. Be the first to review this product!</p>
                    )}
                    
                    {product.reviewCount > 2 && (
                      <Button variant="link" className="mt-4 px-0">
                        Load More Reviews
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
