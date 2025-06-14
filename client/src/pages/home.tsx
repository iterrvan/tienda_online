import { useState } from "react";
import Header from "@/components/header";
import ProductFilters from "@/components/product-filters";
import ProductCard from "@/components/product-card";
import CartSidebar from "@/components/cart-sidebar";
import CheckoutModal from "@/components/checkout-modal";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { ProductWithCategory, Category } from "@shared/schema";
import { ProductFilters as ProductFiltersType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Home() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFiltersType>({});
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  // Query para obtener productos
  const {
    data: products = [],
    isLoading: isProductsLoading,
    error: productsError
  } = useQuery<ProductWithCategory[]>({
    queryKey: ["/api/products", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
      if (filters.search) params.append('search', filters.search);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Error al cargar productos');
      return response.json();
    }
  });

  // Query para obtener categorías
  const {
    data: categories = [],
    isLoading: isCategoriesLoading
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"]
  });

  // Ordenar productos
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "rating":
        return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
    }
  });

  // Paginación
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setTimeout(() => setIsCheckoutOpen(true), 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        onCartToggle={() => setIsCartOpen(!isCartOpen)}
        onSearchChange={(search) => handleFiltersChange({ ...filters, search })}
      />

      {/* Hero Section */}
      <section className="gradient-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">¡Ofertas Especiales!</h2>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Hasta 50% de descuento en productos seleccionados
            </p>
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-8 text-lg"
              onClick={() => handleFiltersChange({ ...filters, categoryId: undefined })}
            >
              Ver Ofertas
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar de filtros */}
          <aside className="lg:w-64 flex-shrink-0">
            <ProductFilters
              categories={categories}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isLoading={isCategoriesLoading}
            />
          </aside>

          {/* Grid de productos */}
          <div className="flex-1">
            
            {/* Encabezado con ordenamiento */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                Productos Destacados
                {products.length > 0 && (
                  <span className="text-sm font-normal text-gray-600 ml-2">
                    ({products.length} productos)
                  </span>
                )}
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Ordenar por:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Más recientes</SelectItem>
                    <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                    <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                    <SelectItem value="rating">Mejor calificados</SelectItem>
                    <SelectItem value="name">Nombre A-Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Loading State */}
            {isProductsLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-4">
                    <Skeleton className="w-full h-48 mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {productsError && (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">Error al cargar los productos</p>
                <Button onClick={() => window.location.reload()}>
                  Intentar de nuevo
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!isProductsLoading && products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No se encontraron productos</p>
                <Button onClick={() => setFilters({})}>
                  Limpiar filtros
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!isProductsLoading && paginatedProducts.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <nav className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
