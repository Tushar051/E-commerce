import React from 'react';
import { Link } from 'wouter';

export default function PromoSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5" 
                alt="Electronics Collection" 
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">Electronics</h3>
                  <p className="text-white/90 mb-4">Save up to 20% on the latest gadgets</p>
                  <Link 
                    href="/categories/electronics" 
                    className="inline-block bg-white text-primary font-medium px-5 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2">
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1479064555552-3ef4979f8908" 
                alt="Fashion Collection" 
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
                <div className="p-8">
                  <h3 className="text-white text-2xl font-bold mb-2">Fashion</h3>
                  <p className="text-white/90 mb-4">New arrivals for summer collection</p>
                  <Link 
                    href="/categories/fashion" 
                    className="inline-block bg-white text-primary font-medium px-5 py-2 rounded-lg hover:bg-gray-100"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
