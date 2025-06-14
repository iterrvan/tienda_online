import { db } from "./db";
import { categories, products } from "@shared/schema";

async function seed() {
  console.log("🌱 Iniciando población de base de datos...");

  try {
    // Crear categorías
    console.log("📁 Creando categorías...");
    const insertedCategories = await db.insert(categories).values([
      {
        name: "Electrónicos",
        description: "Dispositivos electrónicos y tecnología",
        slug: "electronicos"
      },
      {
        name: "Ropa",
        description: "Vestimenta y accesorios",
        slug: "ropa"
      },
      {
        name: "Hogar",
        description: "Artículos para el hogar",
        slug: "hogar"
      },
      {
        name: "Deportes",
        description: "Equipos y accesorios deportivos",
        slug: "deportes"
      }
    ]).returning();

    const electronicsCategory = insertedCategories.find(c => c.slug === "electronicos");
    const clothingCategory = insertedCategories.find(c => c.slug === "ropa");
    const homeCategory = insertedCategories.find(c => c.slug === "hogar");
    const sportsCategory = insertedCategories.find(c => c.slug === "deportes");

    // Crear productos
    console.log("📦 Creando productos...");
    await db.insert(products).values([
      {
        name: "Smartphone Samsung Galaxy S24",
        description: "Smartphone de última generación con cámara profesional y procesador potente",
        price: "899.00",
        originalPrice: "1059.00",
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory?.id,
        inStock: true,
        stockQuantity: 25,
        lowStockThreshold: 5,
        rating: "4.8",
        reviewCount: 127,
        isOnSale: true,
        salePercentage: 15,
        isActive: true
      },
      {
        name: "MacBook Pro 14\" M3",
        description: "Laptop profesional con chip M3, ideal para trabajo y creatividad",
        price: "1999.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory?.id,
        inStock: true,
        stockQuantity: 15,
        lowStockThreshold: 3,
        rating: "4.7",
        reviewCount: 89,
        isOnSale: false,
        salePercentage: null,
        isActive: true
      },
      {
        name: "AirPods Pro (3ra Gen)",
        description: "Auriculares inalámbricos con cancelación de ruido activa",
        price: "249.00",
        originalPrice: "279.00",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory?.id,
        inStock: true,
        stockQuantity: 40,
        lowStockThreshold: 10,
        rating: "4.9",
        reviewCount: 203,
        isOnSale: true,
        salePercentage: 11,
        isActive: true
      },
      {
        name: "Apple Watch Series 9",
        description: "Reloj inteligente con funciones avanzadas de salud y fitness",
        price: "399.00",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: electronicsCategory?.id,
        inStock: true,
        stockQuantity: 30,
        lowStockThreshold: 8,
        rating: "4.6",
        reviewCount: 156,
        isOnSale: false,
        salePercentage: null,
        isActive: true
      },
      {
        name: "Camiseta Casual Premium",
        description: "Camiseta 100% algodón orgánico, corte moderno y cómodo",
        price: "29.99",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothingCategory?.id,
        inStock: true,
        stockQuantity: 50,
        lowStockThreshold: 15,
        rating: "4.3",
        reviewCount: 67,
        isOnSale: false,
        salePercentage: null,
        isActive: true
      },
      {
        name: "Jeans Clásicos",
        description: "Jeans de mezclilla resistente con corte clásico",
        price: "59.99",
        originalPrice: "79.99",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: clothingCategory?.id,
        inStock: true,
        stockQuantity: 35,
        lowStockThreshold: 10,
        rating: "4.5",
        reviewCount: 94,
        isOnSale: true,
        salePercentage: 25,
        isActive: true
      },
      {
        name: "Lámpara de Mesa LED",
        description: "Lámpara moderna con luz LED ajustable y base de madera",
        price: "79.99",
        originalPrice: null,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: homeCategory?.id,
        inStock: true,
        stockQuantity: 20,
        lowStockThreshold: 5,
        rating: "4.4",
        reviewCount: 32,
        isOnSale: false,
        salePercentage: null,
        isActive: true
      },
      {
        name: "Zapatillas Deportivas",
        description: "Zapatillas ligeras para running con tecnología de amortiguación",
        price: "129.99",
        originalPrice: "149.99",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        categoryId: sportsCategory?.id,
        inStock: true,
        stockQuantity: 45,
        lowStockThreshold: 12,
        rating: "4.7",
        reviewCount: 128,
        isOnSale: true,
        salePercentage: 13,
        isActive: true
      }
    ]);

    console.log("✅ Base de datos poblada exitosamente");
    console.log(`📊 Categorías creadas: ${insertedCategories.length}`);
    console.log("📦 Productos creados: 8");

  } catch (error) {
    console.error("❌ Error poblando la base de datos:", error);
    throw error;
  }
}

// Ejecutar solo si este archivo se ejecuta directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("🎉 Población completada");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Error:", error);
      process.exit(1);
    });
}

export { seed };