import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useNotification } from "@/components/notification-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Minus, Plus, Trash2, ShoppingBag, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export default function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
  const {
    cart,
    isCartLoading,
    totals,
    updateQuantity,
    removeItem,
    clearCart,
    isUpdatingQuantity,
    isRemovingItem
  } = useCart();
  
  const { showNotification } = useNotification();

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity({ itemId, quantity: newQuantity });
  };

  const handleRemoveItem = (itemId: number, productName: string) => {
    removeItem(itemId);
    showNotification(`${productName} removido del carrito`, "info");
  };

  const handleClearCart = () => {
    clearCart();
    showNotification("Carrito vaciado", "info");
  };

  const handleCheckout = () => {
    if (!cart?.items || cart.items.length === 0) {
      showNotification("El carrito está vacío", "error");
      return;
    }
    onCheckout();
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return `$${numPrice.toLocaleString()}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 p-0 flex flex-col">
        
        {/* Header */}
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2" />
              Carrito de Compras
            </SheetTitle>
            {cart?.items && cart.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearCart}
                className="text-gray-500 hover:text-red-500"
              >
                Vaciar
              </Button>
            )}
          </div>
        </SheetHeader>

        {/* Loading State */}
        {isCartLoading && (
          <div className="flex-1 p-4">
            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-16 h-16 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isCartLoading && (!cart?.items || cart.items.length === 0) && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-500 mb-4">
              Agrega algunos productos para comenzar
            </p>
            <Button onClick={onClose} variant="outline">
              Continuar Comprando
            </Button>
          </div>
        )}

        {/* Cart Items */}
        {!isCartLoading && cart?.items && cart.items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <Card key={item.id} className="transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        
                        {/* Product Image */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&h=80";
                          }}
                        />
                        
                        {/* Product Info */}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 line-clamp-2">
                            {item.product.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {formatPrice(item.product.price)}
                          </p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isUpdatingQuantity}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            
                            <span className="w-12 text-center font-medium">
                              {item.quantity}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isUpdatingQuantity}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id, item.product.name)}
                          disabled={isRemovingItem}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Item Total */}
                      <div className="flex justify-between items-center mt-3 pt-3 border-t">
                        <span className="text-sm text-gray-600">Subtotal:</span>
                        <span className="font-medium">
                          {formatPrice(parseFloat(item.product.price) * item.quantity)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Summary and Checkout */}
            <div className="border-t p-4 bg-gray-50">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío:</span>
                  <span>{totals.shipping === 0 ? "Gratis" : formatPrice(totals.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Impuestos (10%):</span>
                  <span>{formatPrice(totals.taxes)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
                
                {/* Free shipping notice */}
                {totals.subtotal < 1000 && (
                  <p className="text-xs text-gray-600 mt-2">
                    Agrega {formatPrice(1000 - totals.subtotal)} más para envío gratuito
                  </p>
                )}
              </div>
              
              <Button
                onClick={handleCheckout}
                className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3"
                size="lg"
              >
                Proceder al Checkout
              </Button>
              
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full mt-2"
              >
                Continuar Comprando
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
