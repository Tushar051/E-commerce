import React from 'react';
import Hero from '@/components/home/Hero';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoSection from '@/components/home/PromoSection';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <div>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <PromoSection />
      <Newsletter />
    </div>
  );
}
