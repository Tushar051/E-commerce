import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ProductFilters } from '@/lib/types';
import ProductGrid from '@/components/products/ProductGrid';
import Filters from '@/components/products/ProductFilters';
import { Button } from '@/components/ui/button';
import { 
  Grid, 
  List, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Search 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function ProductCatalog() {
  const [location] = useLocation();
  const params = useParams<{ slug: string }>();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<ProductFilters>({});

  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    
    const newFilters: ProductFilters = {};
    
    // Handle category from route parameter
    if (params.slug) {
      // Get category by slug (would need an API call in a real app)
      // For now, assuming we're working with a sample category ID
      newFilters.categoryId = 1;
    }
    
    // Handle search query
    if (searchParams.has('search')) {
      newFilters.search = searchParams.get('search') || undefined;
    }
    
    // Handle other filters
    if (searchParams.has('featured')) {
      newFilters.isFeatured = searchParams.get('featured') === 'true';
    }
    
    if (searchParams.has('new')) {
      newFilters.isNew = searchParams.get('new') === 'true';
    }
    
    if (searchParams.has('sale')) {
      newFilters.isSale = searchParams.get('sale') === 'true';
    }
    
    if (searchParams.has('min_price')) {
      newFilters.minPrice = Number(searchParams.get('min_price'));
    }
    
    if (searchParams.has('max_price')) {
      newFilters.maxPrice = Number(searchParams.get('max_price'));
    }
    
    if (searchParams.has('sort_by')) {
      const paramSortBy = searchParams.get('sort_by');
      const paramSortOrder = searchParams.get('sort_order') || 'asc';
      
      if (paramSortBy === 'price' && paramSortOrder === 'asc') {
        setSortBy('price_asc');
      } else if (paramSortBy === 'price' && paramSortOrder === 'desc') {
        setSortBy('price_desc');
      } else if (paramSortBy === 'name') {
        setSortBy('name');
      } else if (paramSortBy === 'rating') {
        setSortBy('rating');
      } else if (paramSortBy === 'createdAt') {
        setSortBy('newest');
      }
    }
    
    if (searchParams.has('page')) {
      setCurrentPage(Number(searchParams.get('page')));
    }
    
    setFilters(newFilters);
  }, [location, params]);

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });
  
  // Construct API query based on filters
  const getQueryParams = () => {
    const queryParams: Record<string, string> = {
      limit: '9',
      page: currentPage.toString()
    };
    
    if (filters.search) {
      queryParams.search = filters.search;
    }
    
    if (filters.categoryId) {
      queryParams.category_id = filters.categoryId.toString();
    }
    
    if (filters.isFeatured) {
      queryParams.featured = 'true';
    }
    
    if (filters.isNew) {
      queryParams.new = 'true';
    }
    
    if (filters.isSale) {
      queryParams.sale = 'true';
    }
    
    if (filters.minPrice !== undefined) {
      queryParams.min_price = filters.minPrice.toString();
    }
    
    if (filters.maxPrice !== undefined) {
      queryParams.max_price = filters.maxPrice.toString();
    }
    
    // Apply sorting
    if (sortBy === 'price_asc') {
      queryParams.sort_by = 'price';
      queryParams.sort_order = 'asc';
    } else if (sortBy === 'price_desc') {
      queryParams.sort_by = 'price';
      queryParams.sort_order = 'desc';
    } else if (sortBy === 'name') {
      queryParams.sort_by = 'name';
      queryParams.sort_order = 'asc';
    } else if (sortBy === 'rating') {
      queryParams.sort_by = 'rating';
      queryParams.sort_order = 'desc';
    } else if (sortBy === 'newest') {
      queryParams.sort_by = 'createdAt';
      queryParams.sort_order = 'desc';
    }
    
    return queryParams;
  };
  
  // Construct query string for API call
  const queryString = new URLSearchParams(getQueryParams()).toString();
  
  // Fetch products
  const { 
    data, 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: [`/api/products?${queryString}`],
  });
  
  const products = data?.products || [];
  const pagination = data?.pagination || { total: 0, total_pages: 1, current_page: 1 };
  
  // Handle category filter change
  const handleCategoryChange = (categoryId?: number) => {
    setFilters({ ...filters, categoryId });
    setCurrentPage(1);
  };
  
  // Handle price range filter change
  const handlePriceRangeChange = ([min, max]: [number | undefined, number | undefined]) => {
    setFilters({ ...filters, minPrice: min, maxPrice: max });
    setCurrentPage(1);
  };
  
  // Handle brand filter change (sample implementation)
  const handleBrandChange = (brands: string[]) => {
    // In a real app, you'd send these to the API
    console.log('Selected brands:', brands);
    setCurrentPage(1);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  // Handle view mode change
  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({});
    setSortBy('featured');
    setCurrentPage(1);
  };
  
  // Toggle filters on mobile
  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">
          {params.slug ? (
            // Display category name if available, fallback to a generic title
            categories?.find(c => c.slug === params.slug)?.name || 'Product Category'
          ) : filters.search ? (
            `Search Results for "${filters.search}"`
          ) : (
            'Product Catalog'
          )}
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            {/* Mobile filter button */}
            <Button
              variant="outline"
              className="w-full lg:hidden mb-4 flex items-center justify-between"
              onClick={toggleFilters}
            >
              <span className="font-medium">Filters</span>
              <SlidersHorizontal className="h-5 w-5 ml-2" />
            </Button>
            
            {/* Filters */}
            <div className={`${isFilterOpen ? 'block' : 'hidden'} lg:block`}>
              <Filters
                categories={categories || []}
                selectedCategory={filters.categoryId}
                selectedPriceRange={[filters.minPrice, filters.maxPrice]}
                onChangeCategory={handleCategoryChange}
                onChangePriceRange={handlePriceRangeChange}
                onChangeBrands={handleBrandChange}
                onClearFilters={handleClearFilters}
                isMobile={true}
              />
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="lg:w-3/4">
            {/* Sort and View Options */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center mb-6">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2 hidden sm:inline">Sort by:</span>
                <Select 
                  value={sortBy} 
                  onValueChange={handleSortChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Customer Rating</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 items-center">
                <span className="text-gray-600 hidden md:inline">View:</span>
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleViewModeChange('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => handleViewModeChange('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Search result info */}
            {filters.search && (
              <div className="mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <Search className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-600">
                      {pagination.total} results for "{filters.search}"
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Products */}
            <ProductGrid 
              products={products} 
              isLoading={productsLoading || categoriesLoading} 
            />
            
            {/* Pagination */}
            {pagination.total_pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-1" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {[...Array(pagination.total_pages)].map((_, i) => {
                    const page = i + 1;
                    // Show first 3 pages, current page ± 1, and last page
                    if (
                      page <= 3 ||
                      page === pagination.total_pages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          className="px-4"
                        >
                          {page}
                        </Button>
                      );
                    }
                    
                    // Show ellipsis
                    if (
                      page === 4 && currentPage > 5 ||
                      page === pagination.total_pages - 1 && currentPage < pagination.total_pages - 2
                    ) {
                      return <span key={`ellipsis-${page}`} className="px-4 py-2 text-gray-500">...</span>;
                    }
                    
                    return null;
                  })}
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.total_pages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
