import {
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  productImages, type ProductImage, type InsertProductImage,
  cartItems, type CartItem, type InsertCartItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  wishlistItems, type WishlistItem, type InsertWishlistItem
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(options?: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    isFeatured?: boolean;
    isNew?: boolean;
    isSale?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'name' | 'rating' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ products: Product[], total: number }>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;

  // Product image operations
  getProductImages(productId: number): Promise<ProductImage[]>;
  createProductImage(image: InsertProductImage): Promise<ProductImage>;

  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;

  // Order operations
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Wishlist operations
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  getWishlistItem(userId: number, productId: number): Promise<WishlistItem | undefined>;
  createWishlistItem(item: InsertWishlistItem): Promise<WishlistItem>;
  deleteWishlistItem(id: number): Promise<boolean>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private productImages: Map<number, ProductImage>;
  private cartItems: Map<number, CartItem>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private wishlistItems: Map<number, WishlistItem>;

  private userId: number = 1;
  private categoryId: number = 1;
  private productId: number = 1;
  private productImageId: number = 1;
  private cartItemId: number = 1;
  private orderId: number = 1;
  private orderItemId: number = 1;
  private wishlistItemId: number = 1;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.productImages = new Map();
    this.cartItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.wishlistItems = new Map();

    // Initialize with sample data
    this.initSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      (category) => category.slug === slug,
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Product operations
  async getProducts(options: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    isFeatured?: boolean;
    isNew?: boolean;
    isSale?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'price' | 'name' | 'rating' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{ products: Product[], total: number }> {
    let filteredProducts = Array.from(this.products.values());

    // Apply filters
    if (options.categoryId !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === options.categoryId);
    }

    if (options.isFeatured !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isFeatured === options.isFeatured);
    }

    if (options.isNew !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isNew === options.isNew);
    }

    if (options.isSale !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isSale === options.isSale);
    }

    if (options.search) {
      const searchTerm = options.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm)
      );
    }

    if (options.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= options.maxPrice!);
    }

    // Apply sorting
    if (options.sortBy) {
      const sortOrder = options.sortOrder === 'desc' ? -1 : 1;
      
      filteredProducts.sort((a, b) => {
        if (options.sortBy === 'price') {
          return (a.price - b.price) * sortOrder;
        } else if (options.sortBy === 'name') {
          return a.name.localeCompare(b.name) * sortOrder;
        } else if (options.sortBy === 'rating') {
          return ((a.rating || 0) - (b.rating || 0)) * sortOrder;
        } else if (options.sortBy === 'createdAt') {
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * sortOrder;
        }
        return 0;
      });
    }

    // Get total before pagination
    const total = filteredProducts.length;

    // Apply pagination
    if (options.limit !== undefined && options.offset !== undefined) {
      filteredProducts = filteredProducts.slice(options.offset, options.offset + options.limit);
    }

    return { products: filteredProducts, total };
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(
      (product) => product.slug === slug,
    );
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product: Product = { 
      ...insertProduct, 
      id, 
      createdAt: new Date() 
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Product image operations
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return Array.from(this.productImages.values()).filter(
      (image) => image.productId === productId,
    );
  }

  async createProductImage(insertImage: InsertProductImage): Promise<ProductImage> {
    const id = this.productImageId++;
    const image: ProductImage = { ...insertImage, id };
    this.productImages.set(id, image);
    return image;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async getCartItem(userId: number, productId: number): Promise<CartItem | undefined> {
    return Array.from(this.cartItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );
  }

  async createCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = await this.getCartItem(insertItem.userId, insertItem.productId);
    
    if (existingItem) {
      // Update quantity if item exists
      return this.updateCartItem(existingItem.id, existingItem.quantity + insertItem.quantity) as Promise<CartItem>;
    }
    
    // Create new item
    const id = this.cartItemId++;
    const item: CartItem = { 
      ...insertItem, 
      id, 
      addedAt: new Date() 
    };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const cartItems = await this.getCartItems(userId);
    
    for (const item of cartItems) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      createdAt: new Date() 
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const item: OrderItem = { ...insertItem, id };
    this.orderItems.set(id, item);
    return item;
  }

  // Wishlist operations
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values()).filter(
      (item) => item.userId === userId,
    );
  }

  async getWishlistItem(userId: number, productId: number): Promise<WishlistItem | undefined> {
    return Array.from(this.wishlistItems.values()).find(
      (item) => item.userId === userId && item.productId === productId,
    );
  }

  async createWishlistItem(insertItem: InsertWishlistItem): Promise<WishlistItem> {
    // Check if item already exists
    const existingItem = await this.getWishlistItem(insertItem.userId, insertItem.productId);
    
    if (existingItem) {
      return existingItem;
    }
    
    // Create new item
    const id = this.wishlistItemId++;
    const item: WishlistItem = { 
      ...insertItem, 
      id, 
      addedAt: new Date() 
    };
    this.wishlistItems.set(id, item);
    return item;
  }

  async deleteWishlistItem(id: number): Promise<boolean> {
    return this.wishlistItems.delete(id);
  }

  // Initialize with sample data
  private initSampleData() {
    // Add sample user
    this.createUser({
      username: "user1",
      password: "password123",
      email: "user@example.com",
      firstName: "John",
      lastName: "Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "United States",
      phone: "(123) 456-7890"
    });

    // Add sample categories
    const categories = [
      { name: "Electronics", slug: "electronics", image: "https://images.unsplash.com/photo-1623998022290-a74f8cc36563" },
      { name: "Fashion", slug: "fashion", image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f" },
      { name: "Home & Garden", slug: "home-garden", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f" },
      { name: "Sports", slug: "sports", image: "https://images.unsplash.com/photo-1599058917765-a780eda07a3e" },
      { name: "Beauty", slug: "beauty", image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad" },
      { name: "Toys", slug: "toys", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302" },
      { name: "Books", slug: "books", image: "https://images.unsplash.com/photo-1535398089889-dd807df1dfaa" }
    ];

    categories.forEach(category => this.createCategory(category));

    // Add sample products
    const products = [
      {
        name: "Nike Air Max",
        slug: "nike-air-max",
        description: "The Nike Air Max features a lightweight design with responsive cushioning, perfect for both athletic performance and casual wear. This iconic sneaker offers superior comfort and timeless style.",
        price: 120.00,
        compareAtPrice: 160.00,
        categoryId: 2, // Fashion
        brand: "Nike",
        sku: "NKE-AM-101",
        stock: 12,
        rating: 4.5,
        reviewCount: 120,
        featuredImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
        isNew: false,
        isFeatured: true,
        isSale: true
      },
      {
        name: "Smart Watch",
        slug: "smart-watch",
        description: "Stay connected with this premium smartwatch. Track your fitness, receive notifications, and more with this sleek and stylish wearable device.",
        price: 199.99,
        compareAtPrice: null,
        categoryId: 1, // Electronics
        brand: "TechGear",
        sku: "TG-SW-202",
        stock: 25,
        rating: 4.0,
        reviewCount: 85,
        featuredImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
        isNew: false,
        isFeatured: true,
        isSale: false
      },
      {
        name: "Luxury Perfume",
        slug: "luxury-perfume",
        description: "An exquisite fragrance that combines floral and woody notes. Long-lasting and perfect for special occasions.",
        price: 89.99,
        compareAtPrice: 99.99,
        categoryId: 5, // Beauty
        brand: "Essence",
        sku: "ESS-LP-303",
        stock: 18,
        rating: 5.0,
        reviewCount: 42,
        featuredImage: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
        isNew: false,
        isFeatured: true,
        isSale: true
      },
      {
        name: "Designer Sunglasses",
        slug: "designer-sunglasses",
        description: "Protect your eyes in style with these premium designer sunglasses. Featuring UV protection and a lightweight design.",
        price: 79.99,
        compareAtPrice: null,
        categoryId: 2, // Fashion
        brand: "VisionStyle",
        sku: "VS-DS-404",
        stock: 10,
        rating: 3.5,
        reviewCount: 18,
        featuredImage: "https://images.unsplash.com/photo-1572635196237-14b3f281503f",
        isNew: true,
        isFeatured: true,
        isSale: false
      },
      {
        name: "Wireless Earbuds",
        slug: "wireless-earbuds",
        description: "Experience premium sound quality with these comfortable wireless earbuds. Perfect for workouts or daily use.",
        price: 89.99,
        compareAtPrice: null,
        categoryId: 1, // Electronics
        brand: "SoundWave",
        sku: "SW-WE-505",
        stock: 30,
        rating: 4.5,
        reviewCount: 120,
        featuredImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
        isNew: true,
        isFeatured: false,
        isSale: false
      },
      {
        name: "Laptop Backpack",
        slug: "laptop-backpack",
        description: "A spacious and durable backpack with padded compartments for your laptop and other essentials.",
        price: 49.99,
        compareAtPrice: 69.99,
        categoryId: 2, // Fashion
        brand: "PackMaster",
        sku: "PM-LB-606",
        stock: 15,
        rating: 4.0,
        reviewCount: 85,
        featuredImage: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2",
        isNew: false,
        isFeatured: false,
        isSale: true
      },
      {
        name: "Bluetooth Speaker",
        slug: "bluetooth-speaker",
        description: "A portable Bluetooth speaker with rich sound and long battery life. Perfect for outdoor activities and parties.",
        price: 79.99,
        compareAtPrice: null,
        categoryId: 1, // Electronics
        brand: "AudioMax",
        sku: "AM-BS-707",
        stock: 22,
        rating: 5.0,
        reviewCount: 42,
        featuredImage: "https://images.unsplash.com/photo-1548484352-ea579e5233a8",
        isNew: false,
        isFeatured: false,
        isSale: false
      },
      {
        name: "Smart Home Hub",
        slug: "smart-home-hub",
        description: "Control your smart home devices from a single hub. Compatible with most smart home systems.",
        price: 129.99,
        compareAtPrice: null,
        categoryId: 1, // Electronics
        brand: "HomeConnect",
        sku: "HC-SH-808",
        stock: 8,
        rating: 3.5,
        reviewCount: 18,
        featuredImage: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1",
        isNew: false,
        isFeatured: false,
        isSale: false
      },
      {
        name: "Camera Lens",
        slug: "camera-lens",
        description: "A professional-grade camera lens for capturing stunning photos and videos. Wide aperture for low-light conditions.",
        price: 249.99,
        compareAtPrice: 299.99,
        categoryId: 1, // Electronics
        brand: "OptikPro",
        sku: "OP-CL-909",
        stock: 5,
        rating: 4.0,
        reviewCount: 34,
        featuredImage: "https://images.unsplash.com/photo-1532435109783-fdb8a2be0baa",
        isNew: false,
        isFeatured: false,
        isSale: true
      },
      {
        name: "Gaming Controller",
        slug: "gaming-controller",
        description: "An ergonomic gaming controller with customizable buttons and improved response time for competitive gaming.",
        price: 69.99,
        compareAtPrice: null,
        categoryId: 1, // Electronics
        brand: "GameMaster",
        sku: "GM-GC-010",
        stock: 17,
        rating: 4.5,
        reviewCount: 127,
        featuredImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
        isNew: false,
        isFeatured: false,
        isSale: false
      }
    ];

    products.forEach(product => this.createProduct(product));

    // Add product images
    const productImages = [
      { productId: 1, url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff", alt: "Nike Air Max - 1" },
      { productId: 1, url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa", alt: "Nike Air Max - 2" },
      { productId: 1, url: "https://images.unsplash.com/photo-1576672843344-f01907a9d40c", alt: "Nike Air Max - 3" },
      { productId: 1, url: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28", alt: "Nike Air Max - 4" },
      { productId: 2, url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30", alt: "Smart Watch - 1" },
      { productId: 3, url: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad", alt: "Luxury Perfume - 1" },
      { productId: 4, url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f", alt: "Designer Sunglasses - 1" },
      { productId: 5, url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9", alt: "Wireless Earbuds - 1" },
      { productId: 6, url: "https://images.unsplash.com/photo-1593998066526-65fcab3021a2", alt: "Laptop Backpack - 1" },
      { productId: 7, url: "https://images.unsplash.com/photo-1548484352-ea579e5233a8", alt: "Bluetooth Speaker - 1" },
      { productId: 8, url: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1", alt: "Smart Home Hub - 1" },
      { productId: 9, url: "https://images.unsplash.com/photo-1532435109783-fdb8a2be0baa", alt: "Camera Lens - 1" },
      { productId: 10, url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302", alt: "Gaming Controller - 1" }
    ];

    productImages.forEach(image => this.createProductImage(image));

    // Add sample cart items for user 1
    this.createCartItem({ userId: 1, productId: 1, quantity: 1 });
    this.createCartItem({ userId: 1, productId: 2, quantity: 1 });

    // Add sample wishlist items for user 1
    this.createWishlistItem({ userId: 1, productId: 3 });
    this.createWishlistItem({ userId: 1, productId: 4 });
    this.createWishlistItem({ userId: 1, productId: 5 });

    // Add sample order for user 1
    this.createOrder({
      userId: 1,
      total: 339.99,
      status: "completed",
      shippingAddress: "123 Main St",
      shippingCity: "New York",
      shippingState: "NY",
      shippingPostalCode: "10001",
      shippingCountry: "United States"
    }).then(order => {
      // Add sample order items
      this.createOrderItem({ orderId: order.id, productId: 1, quantity: 1, price: 120.00 });
      this.createOrderItem({ orderId: order.id, productId: 2, quantity: 1, price: 199.99 });
    });
  }
}

export const storage = new MemStorage();
