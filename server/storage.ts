import { 
  users, categories, products, carts, cartItems, orders, orderItems,
  type User, type UpsertUser, type InsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type Cart, type InsertCart,
  type CartItem, type InsertCartItem, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithCategory,
  type CartItemWithProduct, type CartWithItems, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc, like, ilike, sql } from "drizzle-orm";

export interface IStorage {
  // Usuarios para Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByRole(role: string): Promise<User[]>;
  
  // Usuarios legacy (mantener compatibilidad)
  getUserByUsername(username: string): Promise<User | undefined>;

  // Categorías
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Productos con gestión de inventario
  getProducts(filters?: { categoryId?: number; search?: string; minPrice?: number; maxPrice?: number; includeInactive?: boolean }): Promise<ProductWithCategory[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  updateStock(productId: number, quantity: number): Promise<Product>;
  getLowStockProducts(): Promise<Product[]>;

  // Carrito
  getCartBySessionId(sessionId: string): Promise<CartWithItems | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  addToCart(cartId: number, productId: number, quantity: number): Promise<CartItem>;
  updateCartItem(cartItemId: number, quantity: number): Promise<CartItem>;
  removeFromCart(cartItemId: number): Promise<void>;
  clearCart(cartId: number): Promise<void>;

  // Órdenes
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  getOrderById(id: number): Promise<OrderWithItems | undefined>;
  getOrdersBySessionId(sessionId: string): Promise<Order[]>;
}

export class DatabaseStorage implements IStorage {

  // Usuarios para Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Usuarios legacy (compatibilidad)
  async getUserByUsername(username: string): Promise<User | undefined> {
    return undefined;
  }

  // Categorías
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  // Productos con gestión de inventario
  async getProducts(filters?: { 
    categoryId?: number; 
    search?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    includeInactive?: boolean 
  }): Promise<ProductWithCategory[]> {
    
    let baseQuery = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        originalPrice: products.originalPrice,
        image: products.image,
        categoryId: products.categoryId,
        inStock: products.inStock,
        stockQuantity: products.stockQuantity,
        lowStockThreshold: products.lowStockThreshold,
        rating: products.rating,
        reviewCount: products.reviewCount,
        isOnSale: products.isOnSale,
        salePercentage: products.salePercentage,
        isActive: products.isActive,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          description: categories.description,
          slug: categories.slug,
          createdAt: categories.createdAt,
        }
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    const conditions = [];

    // Filtrar productos inactivos por defecto
    if (!filters?.includeInactive) {
      conditions.push(eq(products.isActive, true));
    }

    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }

    if (filters?.search) {
      conditions.push(
        ilike(products.name, `%${filters.search}%`)
      );
    }

    if (filters?.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }

    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }

    let finalQuery = baseQuery;
    if (conditions.length > 0) {
      finalQuery = baseQuery.where(and(...conditions));
    }

    const results = await finalQuery.orderBy(desc(products.createdAt));

    return results.map((row: any) => ({
      ...row,
      category: row.category?.id ? row.category : undefined
    }));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(products.id, id));
  }

  async updateStock(productId: number, quantity: number): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ 
        stockQuantity: quantity,
        inStock: quantity > 0,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId))
      .returning();
    return product;
  }

  async getLowStockProducts(): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          lte(products.stockQuantity, products.lowStockThreshold)
        )
      );
  }

  // Carrito
  async getCartBySessionId(sessionId: string): Promise<CartWithItems | undefined> {
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.sessionId, sessionId));
    
    if (!cart) return undefined;

    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          originalPrice: products.originalPrice,
          image: products.image,
          description: products.description,
          categoryId: products.categoryId,
          inStock: products.inStock,
          stockQuantity: products.stockQuantity,
          lowStockThreshold: products.lowStockThreshold,
          rating: products.rating,
          reviewCount: products.reviewCount,
          isOnSale: products.isOnSale,
          salePercentage: products.salePercentage,
          isActive: products.isActive,
          createdAt: products.createdAt,
          updatedAt: products.updatedAt,
        }
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    return {
      ...cart,
      items: items.map(item => ({
        ...item,
        product: item.product
      }))
    };
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const [cart] = await db
      .insert(carts)
      .values(insertCart)
      .returning();
    return cart;
  }

  async addToCart(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    // Verificar si ya existe el item en el carrito
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)));

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + quantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    // Crear nuevo item
    const [cartItem] = await db
      .insert(cartItems)
      .values({
        cartId,
        productId,
        quantity
      })
      .returning();
    return cartItem;
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<CartItem> {
    const [cartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, cartItemId))
      .returning();
    return cartItem;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
  }

  async clearCart(cartId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  // Órdenes
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();

    const orderItemsData = items.map(item => ({
      ...item,
      orderId: order.id
    }));

    const insertedItems = await db
      .insert(orderItems)
      .values(orderItemsData)
      .returning();

    return {
      ...order,
      items: insertedItems
    };
  }

  async getOrderById(id: number): Promise<OrderWithItems | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    
    if (!order) return undefined;

    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return {
      ...order,
      items
    };
  }

  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.sessionId, sessionId))
      .orderBy(desc(orders.createdAt));
  }
}

export const storage = new DatabaseStorage();