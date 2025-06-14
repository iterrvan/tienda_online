import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Category } from "@shared/schema";
import { ProductFilters as ProductFiltersType } from "@/lib/types";
import { Star, X } from "lucide-react";

interface ProductFiltersProps {
  categories: Category[];
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
  isLoading: boolean;
}

export default function ProductFilters({
  categories,
  filters,
  onFiltersChange,
  isLoading
}: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState([filters.minPrice || 0, filters.maxPrice || 1000]);
  const [selectedRating, setSelectedRating] = useState<string>("");

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    if (checked) {
      onFiltersChange({ ...filters, categoryId });
    } else {
      const { categoryId: _, ...newFilters } = filters;
      onFiltersChange(newFilters);
    }
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      minPrice: values[0] > 0 ? values[0] : undefined,
      maxPrice: values[1] < 1000 ? values[1] : undefined
    });
  };

  const handleRatingChange = (rating: string) => {
    setSelectedRating(rating);
    // En una implementación real, esto se pasaría también a los filtros
  };

  const clearAllFilters = () => {
    setPriceRange([0, 1000]);
    setSelectedRating("");
    onFiltersChange({});
  };

  const hasActiveFilters = filters.categoryId || filters.minPrice || filters.maxPrice || filters.search;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Skeleton className="h-4 w-20 mb-3" />
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Filtros</CardTitle>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        
        {/* Categorías */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Categorías</h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.categoryId === category.id}
                  onCheckedChange={(checked) => 
                    handleCategoryChange(category.id, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={`category-${category.id}`}
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rango de precios */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Precio</h4>
          <div className="space-y-3">
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}{priceRange[1] >= 1000 ? "+" : ""}</span>
            </div>
          </div>
        </div>

        {/* Calificación */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Calificación</h4>
          <RadioGroup value={selectedRating} onValueChange={handleRatingChange}>
            {[5, 4, 3, 2].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={rating.toString()}
                  id={`rating-${rating}`}
                />
                <Label 
                  htmlFor={`rating-${rating}`}
                  className="flex items-center cursor-pointer"
                >
                  <div className="flex text-yellow-400 mr-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < rating ? "fill-current" : "stroke-current"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">y más</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Filtros activos */}
        {hasActiveFilters && (
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Filtros Activos</h4>
            <div className="space-y-2">
              {filters.categoryId && (
                <div className="flex items-center justify-between bg-primary/10 px-2 py-1 rounded text-sm">
                  <span>
                    {categories.find(c => c.id === filters.categoryId)?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-primary hover:text-primary/80"
                    onClick={() => {
                      const { categoryId: _, ...newFilters } = filters;
                      onFiltersChange(newFilters);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {(filters.minPrice || filters.maxPrice) && (
                <div className="flex items-center justify-between bg-primary/10 px-2 py-1 rounded text-sm">
                  <span>
                    ${filters.minPrice || 0} - ${filters.maxPrice || 1000}+
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-primary hover:text-primary/80"
                    onClick={() => {
                      const { minPrice: __, maxPrice: ___, ...newFilters } = filters;
                      onFiltersChange(newFilters);
                      setPriceRange([0, 1000]);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {filters.search && (
                <div className="flex items-center justify-between bg-primary/10 px-2 py-1 rounded text-sm">
                  <span>"{filters.search}"</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-primary hover:text-primary/80"
                    onClick={() => {
                      const { search: _, ...newFilters } = filters;
                      onFiltersChange(newFilters);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
