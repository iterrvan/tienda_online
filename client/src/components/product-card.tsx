import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useNotification } from "@/components/notification-toast";
import { ProductWithCategory } from "@shared/schema";
import { Star, Heart, ShoppingCart } from "lucide-react";

interface ProductCardProps {
  product: ProductWithCategory;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const { addToCart, isAddingToCart } = useCart();
  const { showNotification } = useNotification();

  const handleAddToCart = () => {
    addToCart({ productId: product.id });
    showNotification(`${product.name} agregado al carrito`, "success");
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    showNotification(
      isFavorite ? "Removido de favoritos" : "Agregado a favoritos",
      isFavorite ? "info" : "success"
    );
  };

  const renderStars = (rating: string) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;
    
    return (
      <div className="flex text-yellow-400 text-sm">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < fullStars 
                ? "fill-current" 
                : i === fullStars && hasHalfStar 
                ? "fill-current opacity-50" 
                : "stroke-current"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toLocaleString()}`;
  };

  const calculateDiscount = () => {
    if (!product.originalPrice || !product.isOnSale) return null;
    const original = parseFloat(product.originalPrice);
    const current = parseFloat(product.price);
    const discount = Math.round(((original - current) / original) * 100);
    return discount;
  };

  const discount = calculateDiscount();

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group hover-lift">
      <div className="relative">
        {/* Imagen del producto */}
        <div className="relative w-full h-48 bg-gray-100">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="spinner"></div>
            </div>
          )}
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300";
              setIsImageLoaded(true);
            }}
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isOnSale && discount && (
            <Badge className="bg-amber-500 hover:bg-amber-600 text-white">
              -{discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge variant="destructive">
              Agotado
            </Badge>
          )}
        </div>

        {/* Botón de favoritos */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 p-1"
          onClick={toggleFavorite}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? "fill-current text-red-500" : ""}`}
          />
        </Button>
      </div>

      <div className="p-4">
        {/* Nombre del producto */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Categoría */}
        {product.category && (
          <p className="text-xs text-gray-500 mb-2">
            {product.category.name}
          </p>
        )}

        {/* Rating y reviews */}
        <div className="flex items-center mb-2">
          {renderStars(product.rating || "0")}
          <span className="text-gray-600 text-sm ml-1">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* Precios y acciones */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.isOnSale && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            {isAddingToCart ? (
              <div className="spinner" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Estado de stock */}
        {!product.inStock && (
          <p className="text-sm text-red-600 mt-2 font-medium">
            Producto no disponible
          </p>
        )}
      </div>
    </div>
  );
}
