import { 
  users, categories, products, carts, cartItems, orders, orderItems,
  type User, type InsertUser, type Category, type InsertCategory,
  type Product, type InsertProduct, type Cart, type InsertCart,
  type CartItem, type InsertCartItem, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type ProductWithCategory,
  type CartItemWithProduct, type CartWithItems, type OrderWithItems
} from "@shared/schema";

export interface IStorage {
  // Usuarios
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Categorías
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Productos
  getProducts(filters?: { categoryId?: number; search?: string; minPrice?: number; maxPrice?: number }): Promise<ProductWithCategory[]>;
  getProductById(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private carts: Map<number, Cart> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  
  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentProductId = 1;
  private currentCartId = 1;
  private currentCartItemId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Crear categorías de ejemplo
    const electronicsCategory: Category = {
      id: this.currentCategoryId++,
      name: "Electrónicos",
      description: "Dispositivos electrónicos y tecnología",
      slug: "electronicos",
      createdAt: new Date()
    };
    
    const clothingCategory: Category = {
      id: this.currentCategoryId++,
      name: "Ropa",
      description: "Vestimenta y accesorios",
      slug: "ropa",
      createdAt: new Date()
    };

    const homeCategory: Category = {
      id: this.currentCategoryId++,
      name: "Hogar",
      description: "Artículos para el hogar",
      slug: "hogar",
      createdAt: new Date()
    };

    const sportsCategory: Category = {
      id: this.currentCategoryId++,
      name: "Deportes",
      description: "Equipos y accesorios deportivos",
      slug: "deportes",
      createdAt: new Date()
    };

    this.categories.set(electronicsCategory.id, electronicsCategory);
    this.categories.set(clothingCategory.id, clothingCategory);
    this.categories.set(homeCategory.id, homeCategory);
    this.categories.set(sportsCategory.id, sportsCategory);

    // Crear productos de ejemplo
    const sampleProducts: Omit<Product, 'id' | 'createdAt'>[] = [
      {
        name: "Smartphone Samsung Galaxy S24",
        description: "Smartphone de última generación con cámara profesional y procesador potente",
        price: "899.00",
        originalPrice: "1059.00",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.8",
        reviewCount: 127,
        isOnSale: true,
        salePercentage: 15
      },
      {
        name: "MacBook Pro 14\" M3",
        description: "Laptop profesional con chip M3, ideal para trabajo y creatividad",
        price: "1999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.7",
        reviewCount: 89,
        isOnSale: false,
        salePercentage: null
      },
      {
        name: "AirPods Pro (3ra Gen)",
        description: "Auriculares inalámbricos con cancelación de ruido activa",
        price: "249.00",
        originalPrice: "279.00",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.9",
        reviewCount: 203,
        isOnSale: true,
        salePercentage: 11
      },
      {
        name: "Apple Watch Series 9",
        description: "Reloj inteligente con funciones avanzadas de salud y fitness",
        price: "399.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.6",
        reviewCount: 156,
        isOnSale: false,
        salePercentage: null
      },
      {
        name: "Cámara Canon EOS R6 Mark II",
        description: "Cámara profesional con sensor full frame y grabación 4K",
        price: "2499.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.9",
        reviewCount: 67,
        isOnSale: false,
        salePercentage: null
      },
      {
        name: "iPad Pro 12.9\" M2",
        description: "Tablet profesional con pantalla Liquid Retina XDR",
        price: "1099.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.7",
        reviewCount: 94,
        isOnSale: false,
        salePercentage: null
      },
      {
        name: "PlayStation 5",
        description: "Consola de videojuegos de nueva generación",
        price: "499.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.8",
        reviewCount: 312,
        isOnSale: false,
        salePercentage: null
      },
      {
        name: "Monitor Gaming 4K 27\"",
        description: "Monitor para gaming con resolución 4K y alta frecuencia de actualización",
        price: "399.00",
        originalPrice: "499.00",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory.id,
        inStock: true,
        rating: "4.5",
        reviewCount: 78,
        isOnSale: true,
        salePercentage: 20
      }
    ];

    sampleProducts.forEach(product => {
      const newProduct: Product = {
        ...product,
        id: this.currentProductId++,
        createdAt: new Date()
      };
      this.products.set(newProduct.id, newProduct);
    });
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
