import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CartWithItems } from "@shared/schema";
import { CartTotals } from "@/lib/types";

export function useCart() {
  const queryClient = useQueryClient();

  // Query para obtener el carrito
  const {
    data: cart,
    isLoading: isCartLoading,
    error: cartError
  } = useQuery<CartWithItems>({
    queryKey: ["/api/cart"],
    staleTime: 0,
    refetchOnMount: true
  });

  // Mutation para agregar al carrito
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: number; quantity?: number }) => {
      const response = await apiRequest("POST", "/api/cart/add", { productId, quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
    }
  });

  // Mutation para actualizar cantidad
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/cart/items/${itemId}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  // Mutation para remover item
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await apiRequest("DELETE", `/api/cart/items/${itemId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  // Mutation para limpiar carrito
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    }
  });

  // Calcular totales
  const calculateTotals = (): CartTotals => {
    if (!cart?.items) {
      return { subtotal: 0, shipping: 0, taxes: 0, total: 0 };
    }

    const subtotal = cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.product.price) * item.quantity);
    }, 0);

    const shipping = subtotal > 1000 ? 0 : 15; // Envío gratuito para pedidos > $1000
    const taxes = Math.round(subtotal * 0.1 * 100) / 100; // 10% de impuestos
    const total = subtotal + shipping + taxes;

    return { subtotal, shipping, taxes, total };
  };

  // Obtener cantidad total de items
  const getTotalItems = (): number => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    cart,
    isCartLoading,
    cartError,
    totals: calculateTotals(),
    totalItems: getTotalItems(),
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeItem: removeItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingQuantity: updateQuantityMutation.isPending,
    isRemovingItem: removeItemMutation.isPending,
    isClearingCart: clearCartMutation.isPending
  };
}
