import { 
  users, categories, products, carts, cartItems, orders, orderItems,
  type User, type UpsertUser, type InsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type Cart, type InsertCart,
  type CartItem, type InsertCartItem, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithCategory,
  type CartItemWithProduct, type CartWithItems, type OrderWithItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, asc } from "drizzle-orm";

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
    
    let query = db
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
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        // Use SQL function for case-insensitive search
        eq(db.raw`LOWER(${products.name}) LIKE ${searchTerm}`)
      );
    }

    if (filters?.minPrice !== undefined) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }

    if (filters?.maxPrice !== undefined) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.orderBy(desc(products.createdAt));

    return results.map(row => ({
      ...row,
      category: row.category.id ? row.category : undefined
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

  // Implementación de métodos de usuarios
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Implementación de métodos de categorías
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id, 
      createdAt: new Date() 
    };
    this.categories.set(id, category);
    return category;
  }

  // Implementación de métodos de productos
  async getProducts(filters?: { categoryId?: number; search?: string; minPrice?: number; maxPrice?: number }): Promise<ProductWithCategory[]> {
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(search) || 
          p.description?.toLowerCase().includes(search)
        );
      }
      if (filters.minPrice !== undefined) {
        products = products.filter(p => parseFloat(p.price) >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(p => parseFloat(p.price) <= filters.maxPrice!);
      }
    }

    return products.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) : undefined
    }));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  // Implementación de métodos de carrito
  async getCartBySessionId(sessionId: string): Promise<CartWithItems | undefined> {
    const cart = Array.from(this.carts.values()).find(c => c.sessionId === sessionId);
    if (!cart) return undefined;

    const items = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cart.id)
      .map(item => ({
        ...item,
        product: this.products.get(item.productId!)!
      }))
      .filter(item => item.product);

    return { ...cart, items };
  }

  async createCart(insertCart: InsertCart): Promise<Cart> {
    const id = this.currentCartId++;
    const cart: Cart = { 
      ...insertCart, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.carts.set(id, cart);
    return cart;
  }

  async addToCart(cartId: number, productId: number, quantity: number): Promise<CartItem> {
    // Verificar si ya existe el item en el carrito
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.cartId === cartId && item.productId === productId);

    if (existingItem) {
      // Actualizar cantidad
      existingItem.quantity += quantity;
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    } else {
      // Crear nuevo item
      const id = this.currentCartItemId++;
      const cartItem: CartItem = {
        id,
        cartId,
        productId,
        quantity,
        createdAt: new Date()
      };
      this.cartItems.set(id, cartItem);
      return cartItem;
    }
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<CartItem> {
    const item = this.cartItems.get(cartItemId);
    if (!item) throw new Error("Item del carrito no encontrado");
    
    item.quantity = quantity;
    this.cartItems.set(cartItemId, item);
    return item;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    this.cartItems.delete(cartItemId);
  }

  async clearCart(cartId: number): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.cartId === cartId)
      .map(([id, _]) => id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }

  // Implementación de métodos de órdenes
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const orderId = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id: orderId, 
      createdAt: new Date() 
    };
    this.orders.set(orderId, order);

    const orderItemsData: OrderItem[] = items.map(item => ({
      ...item,
      id: this.currentOrderItemId++,
      orderId
    }));

    orderItemsData.forEach(item => {
      this.orderItems.set(item.id, item);
    });

    return { ...order, items: orderItemsData };
  }

  async getOrderById(id: number): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id);

    return { ...order, items };
  }

  async getOrdersBySessionId(sessionId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.sessionId === sessionId);
  }
}

export const storage = new MemStorage();
