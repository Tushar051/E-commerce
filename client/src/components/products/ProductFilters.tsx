import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, X } from 'lucide-react';
import { Category } from '@/lib/types';

interface ProductFiltersProps {
  categories: Category[];
  selectedCategory?: number;
  selectedPriceRange?: [number | undefined, number | undefined];
  selectedBrands?: string[];
  onChangeCategory: (categoryId?: number) => void;
  onChangePriceRange: (range: [number | undefined, number | undefined]) => void;
  onChangeBrands: (brands: string[]) => void;
  onClearFilters: () => void;
  isMobile?: boolean;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  selectedPriceRange = [undefined, undefined],
  selectedBrands = [],
  onChangeCategory,
  onChangePriceRange,
  onChangeBrands,
  onClearFilters,
  isMobile = false
}: ProductFiltersProps) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isBrandOpen, setIsBrandOpen] = useState(true);
  const [minPrice, setMinPrice] = useState<string>(selectedPriceRange[0]?.toString() || '');
  const [maxPrice, setMaxPrice] = useState<string>(selectedPriceRange[1]?.toString() || '');

  // Get unique brands from products (would typically come from API)
  const availableBrands = ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'TechGear', 'Essence', 'VisionStyle'];

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };

  const handleApplyPriceRange = () => {
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    onChangePriceRange([min, max]);
  };

  const handleCategoryChange = (categoryId: number) => {
    onChangeCategory(selectedCategory === categoryId ? undefined : categoryId);
  };

  const handleBrandChange = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onChangeBrands(selectedBrands.filter(b => b !== brand));
    } else {
      onChangeBrands([...selectedBrands, brand]);
    }
  };

  return (
    <div className={`${isMobile ? 'lg:block' : ''} bg-white rounded-lg shadow-sm divide-y`}>
      {/* Categories filter */}
      <div className="p-4">
        <button 
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center justify-between w-full font-medium"
        >
          <span>Categories</span>
          {isCategoryOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
        
        {isCategoryOpen && (
          <div className="mt-3 space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center cursor-pointer">
                <Checkbox 
                  id={`category-${category.id}`}
                  checked={selectedCategory === category.id}
                  onCheckedChange={() => handleCategoryChange(category.id)}
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="ml-2 cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Price range filter */}
      <div className="p-4">
        <button 
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="flex items-center justify-between w-full font-medium"
        >
          <span>Price Range</span>
          {isPriceOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
        
        {isPriceOpen && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2">
              <div>
                <Label htmlFor="min-price">Min</Label>
                <Input 
                  id="min-price"
                  type="number"
                  placeholder="$0"
                  value={minPrice}
                  onChange={handleMinPriceChange}
                  min={0}
                />
              </div>
              <div>
                <Label htmlFor="max-price">Max</Label>
                <Input 
                  id="max-price"
                  type="number"
                  placeholder="$1000"
                  value={maxPrice}
                  onChange={handleMaxPriceChange}
                  min={0}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleApplyPriceRange}
            >
              Apply
            </Button>
            
            <div className="space-y-2">
              <RadioGroup>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="under50" 
                    id="under50"
                    checked={selectedPriceRange[0] === 0 && selectedPriceRange[1] === 50}
                    onClick={() => onChangePriceRange([0, 50])}
                  />
                  <Label htmlFor="under50">Under $50</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="50to100" 
                    id="50to100"
                    checked={selectedPriceRange[0] === 50 && selectedPriceRange[1] === 100}
                    onClick={() => onChangePriceRange([50, 100])}
                  />
                  <Label htmlFor="50to100">$50 - $100</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="100to200" 
                    id="100to200"
                    checked={selectedPriceRange[0] === 100 && selectedPriceRange[1] === 200}
                    onClick={() => onChangePriceRange([100, 200])}
                  />
                  <Label htmlFor="100to200">$100 - $200</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value="over200" 
                    id="over200"
                    checked={selectedPriceRange[0] === 200 && selectedPriceRange[1] === undefined}
                    onClick={() => onChangePriceRange([200, undefined])}
                  />
                  <Label htmlFor="over200">$200+</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}
      </div>
      
      {/* Brand filter */}
      <div className="p-4">
        <button 
          onClick={() => setIsBrandOpen(!isBrandOpen)}
          className="flex items-center justify-between w-full font-medium"
        >
          <span>Brand</span>
          {isBrandOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </button>
        
        {isBrandOpen && (
          <div className="mt-3 space-y-2">
            {availableBrands.map((brand) => (
              <div key={brand} className="flex items-center cursor-pointer">
                <Checkbox 
                  id={`brand-${brand}`}
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandChange(brand)}
                />
                <Label 
                  htmlFor={`brand-${brand}`}
                  className="ml-2 cursor-pointer"
                >
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Clear filters button */}
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onClearFilters}
        >
          <X className="h-4 w-4 mr-2" />
          Clear All Filters
        </Button>
      </div>
    </div>
  );
}
