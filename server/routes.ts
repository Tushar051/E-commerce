import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertCartItemSchema, 
  insertWishlistItemSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  // Check if logged in (mock auth for now)
  apiRouter.get("/auth/me", async (req: Request, res: Response) => {
    // For demo purposes, always return the first user
    const user = await storage.getUser(1);
    if (user) {
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // Login (mock)
  apiRouter.post("/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);
    
    if (user && user.password === password) {
      // Don't send password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Register
  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }
      
      const newUser = await storage.createUser(userData);
      // Don't send password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to register user" });
      }
    }
  });

  // Update user profile
  apiRouter.put("/users/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userData = req.body;
      
      // In a real app, check if user is authorized to update this user
      const updatedUser = await storage.updateUser(Number(id), userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Get all categories
  apiRouter.get("/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Get category by ID
  apiRouter.get("/categories/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const category = await storage.getCategory(Number(id));
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Get products with filtering and pagination
  apiRouter.get("/products", async (req: Request, res: Response) => {
    try {
      const {
        limit = 10,
        page = 1,
        category_id,
        featured,
        new: isNew,
        sale,
        search,
        min_price,
        max_price,
        sort_by,
        sort_order
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);
      
      const { products, total } = await storage.getProducts({
        limit: Number(limit),
        offset,
        categoryId: category_id ? Number(category_id) : undefined,
        isFeatured: featured === 'true',
        isNew: isNew === 'true',
        isSale: sale === 'true',
        search: search as string,
        minPrice: min_price ? Number(min_price) : undefined,
        maxPrice: max_price ? Number(max_price) : undefined,
        sortBy: sort_by as any,
        sortOrder: sort_order as any
      });
      
      // Calculate pagination info
      const totalPages = Math.ceil(total / Number(limit));
      
      res.json({
        products,
        pagination: {
          total,
          total_pages: totalPages,
          current_page: Number(page),
          limit: Number(limit)
        }
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get featured products
  apiRouter.get("/products/featured", async (_req: Request, res: Response) => {
    try {
      const { products } = await storage.getProducts({
        isFeatured: true,
        limit: 4
      });
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  // Get product by ID
  apiRouter.get("/products/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const product = await storage.getProduct(Number(id));
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get product images
      const images = await storage.getProductImages(product.id);
      
      // Get category
      const category = await storage.getCategory(product.categoryId);
      
      res.json({
        ...product,
        images,
        category: category || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get product by slug
  apiRouter.get("/products/slug/:slug", async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const product = await storage.getProductBySlug(slug);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get product images
      const images = await storage.getProductImages(product.id);
      
      // Get category
      const category = await storage.getCategory(product.categoryId);
      
      res.json({
        ...product,
        images,
        category: category || null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Get cart items for user
  apiRouter.get("/cart", async (_req: Request, res: Response) => {
    try {
      // For demo purposes, always use user 1
      const userId = 1;
      
      const cartItems = await storage.getCartItems(userId);
      const cartItemsWithProducts = await Promise.all(cartItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json(cartItemsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  // Add item to cart
  apiRouter.post("/cart", async (req: Request, res: Response) => {
    try {
      // For demo purposes, always use user 1
      req.body.userId = 1;
      
      const cartItemData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.createCartItem(cartItemData);
      
      const product = await storage.getProduct(cartItem.productId);
      
      res.status(201).json({
        ...cartItem,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add item to cart" });
      }
    }
  });

  // Update cart item quantity
  apiRouter.patch("/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      const updatedItem = await storage.updateCartItem(Number(id), quantity);
      
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const product = await storage.getProduct(updatedItem.productId);
      
      res.json({
        ...updatedItem,
        product
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  // Remove item from cart
  apiRouter.delete("/cart/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteCartItem(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  // Clear cart
  apiRouter.delete("/cart", async (_req: Request, res: Response) => {
    try {
      // For demo purposes, always use user 1
      const userId = 1;
      
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Get wishlist items for user
  apiRouter.get("/wishlist", async (_req: Request, res: Response) => {
    try {
      // For demo purposes, always use user 1
      const userId = 1;
      
      const wishlistItems = await storage.getWishlistItems(userId);
      const wishlistItemsWithProducts = await Promise.all(wishlistItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json(wishlistItemsWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  // Add item to wishlist
  apiRouter.post("/wishlist", async (req: Request, res: Response) => {
    try {
      // For demo purposes, always use user 1
      req.body.userId = 1;
      
      const wishlistItemData = insertWishlistItemSchema.parse(req.body);
      const wishlistItem = await storage.createWishlistItem(wishlistItemData);
      
      const product = await storage.getProduct(wishlistItem.productId);
      
      res.status(201).json({
        ...wishlistItem,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add item to wishlist" });
      }
    }
  });

  // Remove item from wishlist
  apiRouter.delete("/wishlist/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWishlistItem(Number(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      
      res.json({ message: "Item removed from wishlist" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from wishlist" });
    }
  });

  // Get orders for user
  apiRouter.get("/orders", async (_req: Request, res: Response) => {
    try {
      // For demo purposes, always use user 1
      const userId = 1;
      
      const orders = await storage.getOrders(userId);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(orders.map(async (order) => {
        const items = await storage.getOrderItems(order.id);
        
        // Get product details for each item
        const itemsWithProducts = await Promise.all(items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        }));
        
        return {
          ...order,
          items: itemsWithProducts
        };
      }));
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Create order
  apiRouter.post("/orders", async (req: Request, res: Response) => {
    try {
      // For demo purposes, always use user 1
      req.body.userId = 1;
      
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Get cart items and add them to the order
      const cartItems = await storage.getCartItems(order.userId);
      
      const orderItems = await Promise.all(cartItems.map(async (cartItem) => {
        const product = await storage.getProduct(cartItem.productId);
        
        if (!product) {
          throw new Error(`Product not found: ${cartItem.productId}`);
        }
        
        return storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          price: product.price
        });
      }));
      
      // Clear the cart
      await storage.clearCart(order.userId);
      
      // Get product details for each item
      const itemsWithProducts = await Promise.all(orderItems.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.status(201).json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create order" });
      }
    }
  });

  // Get order by ID
  apiRouter.get("/orders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(Number(id));
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(order.id);
      
      // Get product details for each item
      const itemsWithProducts = await Promise.all(items.map(async (item) => {
        const product = await storage.getProduct(item.productId);
        return {
          ...item,
          product
        };
      }));
      
      res.json({
        ...order,
        items: itemsWithProducts
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Process payment (dummy implementation)
  apiRouter.post("/create-payment-intent", async (req: Request, res: Response) => {
    try {
      // Extract amount from request body
      const { amount } = req.body;
      
      if (!amount) {
        return res.status(400).json({ message: "Amount is required" });
      }
      
      // Generate a dummy client secret (in a real implementation this would come from Stripe)
      const clientSecret = `pi_${Date.now()}_dummy_secret`;
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      res.json({ 
        clientSecret,
        message: "This is a dummy payment implementation for testing"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to create payment intent" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
