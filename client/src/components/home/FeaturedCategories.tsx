import React from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Category } from '@/lib/types';
import { getCategoryUrl } from '@/lib/utils';

export default function FeaturedCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Show only first 4 categories
  const featuredCategories = categories?.slice(0, 4) || [];

  if (isLoading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Category</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredCategories.map((category: Category) => (
            <Link key={category.id} href={getCategoryUrl(category.slug)} className="group">
              <div className="relative rounded-lg overflow-hidden aspect-square">
                <img 
                  src={category.image}
                  alt={category.name} 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <h3 className="absolute bottom-3 left-3 text-white font-semibold text-lg">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
