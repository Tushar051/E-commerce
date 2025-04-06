import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative bg-gray-100 overflow-hidden">
      <div className="container mx-auto px-4 py-8 md:py-16 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Summer Collection 2023
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover the latest trends and get up to 40% off selected items.
          </p>
          <div className="flex space-x-4">
            <Button asChild>
              <Link href="/products?sale=true">Shop Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/categories">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0 relative">
          <img
            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b"
            alt="Summer Collection"
            className="rounded-xl shadow-lg object-cover w-full max-h-[500px]"
          />
          <div className="absolute -bottom-4 -right-4 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <p className="text-lg font-bold text-gray-800">New Arrivals</p>
            <p className="text-primary font-medium">Starting at $29.99</p>
          </div>
        </div>
      </div>
    </section>
  );
}
