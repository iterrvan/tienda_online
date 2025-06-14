import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";

// Esquemas de validación para las rutas
const addToCartSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1).default(1)
});

const updateCartItemSchema = z.object({
  quantity: z.number().min(0)
});

const checkoutSchema = z.object({
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  shippingAddress: z.string().min(1),
  city: z.string().min(1),
  zipCode: z.string().min(1),
  paymentMethod: z.string().min(1),
  items: z.array(z.object({
    productId: z.number(),
    productName: z.string(),
    productPrice: z.string(),
    quantity: z.number().min(1)
  }))
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Función helper para obtener session ID
  const getSessionId = (req: any) => {
    return req.sessionID || req.headers['x-session-id'] || 'anonymous';
  };

  // Ruta para obtener categorías
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener categorías" });
    }
  });

  // Ruta para obtener productos con filtros opcionales
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, search, minPrice, maxPrice } = req.query;
      
      const filters: any = {};
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (search) filters.search = search as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener productos" });
    }
  });

  // Ruta para obtener un producto por ID
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProductById(id);
      
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener producto" });
    }
  });

  // Ruta para obtener el carrito actual
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      let cart = await storage.getCartBySessionId(sessionId);
      
      if (!cart) {
        // Crear carrito si no existe
        const newCart = await storage.createCart({ sessionId });
        cart = { ...newCart, items: [] };
      }
      
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener carrito" });
    }
  });

  // Ruta para agregar producto al carrito
  app.post("/api/cart/add", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const { productId, quantity } = addToCartSchema.parse(req.body);
      
      // Verificar que el producto existe
      const product = await storage.getProductById(productId);
      if (!product) {
        return res.status(404).json({ message: "Producto no encontrado" });
      }

      // Obtener o crear carrito
      let cart = await storage.getCartBySessionId(sessionId);
      if (!cart) {
        const newCart = await storage.createCart({ sessionId });
        cart = { ...newCart, items: [] };
      }

      // Agregar producto al carrito
      const cartItem = await storage.addToCart(cart.id, productId, quantity);
      
      // Obtener carrito actualizado
      const updatedCart = await storage.getCartBySessionId(sessionId);
      
      res.json(updatedCart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al agregar producto al carrito" });
    }
  });

  // Ruta para actualizar cantidad de un item del carrito
  app.put("/api/cart/items/:id", async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = updateCartItemSchema.parse(req.body);
      
      if (quantity === 0) {
        await storage.removeFromCart(cartItemId);
      } else {
        await storage.updateCartItem(cartItemId, quantity);
      }
      
      const sessionId = getSessionId(req);
      const updatedCart = await storage.getCartBySessionId(sessionId);
      
      res.json(updatedCart);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al actualizar item del carrito" });
    }
  });

  // Ruta para remover un item del carrito
  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      
      await storage.removeFromCart(cartItemId);
      
      const sessionId = getSessionId(req);
      const updatedCart = await storage.getCartBySessionId(sessionId);
      
      res.json(updatedCart);
    } catch (error) {
      res.status(500).json({ message: "Error al remover item del carrito" });
    }
  });

  // Ruta para limpiar todo el carrito
  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const cart = await storage.getCartBySessionId(sessionId);
      
      if (cart) {
        await storage.clearCart(cart.id);
      }
      
      const updatedCart = await storage.getCartBySessionId(sessionId);
      res.json(updatedCart || { items: [] });
    } catch (error) {
      res.status(500).json({ message: "Error al limpiar carrito" });
    }
  });

  // Ruta para procesar checkout
  app.post("/api/checkout", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const checkoutData = checkoutSchema.parse(req.body);
      
      // Calcular totales
      const subtotal = checkoutData.items.reduce((sum, item) => 
        sum + (parseFloat(item.productPrice) * item.quantity), 0
      );
      const shipping = subtotal > 1000 ? 0 : 15;
      const taxes = Math.round(subtotal * 0.1 * 100) / 100;
      const total = subtotal + shipping + taxes;

      // Crear orden
      const orderData = {
        sessionId,
        customerName: checkoutData.customerName,
        customerEmail: checkoutData.customerEmail,
        customerPhone: checkoutData.customerPhone,
        shippingAddress: checkoutData.shippingAddress,
        city: checkoutData.city,
        zipCode: checkoutData.zipCode,
        paymentMethod: checkoutData.paymentMethod,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        taxes: taxes.toFixed(2),
        total: total.toFixed(2),
        status: "confirmed"
      };

      const orderItems = checkoutData.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity
      }));

      const order = await storage.createOrder(orderData, orderItems);

      // Limpiar carrito después de la orden exitosa
      const cart = await storage.getCartBySessionId(sessionId);
      if (cart) {
        await storage.clearCart(cart.id);
      }

      res.json({
        message: "Orden procesada exitosamente",
        orderId: order.id,
        total: order.total
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Datos inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Error al procesar la orden" });
    }
  });

  // Ruta para obtener órdenes del usuario
  app.get("/api/orders", async (req, res) => {
    try {
      const sessionId = getSessionId(req);
      const orders = await storage.getOrdersBySessionId(sessionId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener órdenes" });
    }
  });

  // Ruta para obtener una orden por ID
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrderById(id);
      
      if (!order) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener orden" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
