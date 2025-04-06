import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CartItem, Product } from "../types";
import { apiRequest } from "../queryClient";
import { queryClient } from "../queryClient";

// Create a default context value to avoid runtime errors
const defaultCartContext = {
  cartItems: [] as CartItem[],
  cartCount: 0,
  cartTotal: 0,
  isLoading: false,
  addToCart: async (_product: Product, _quantity: number) => {},
  updateQuantity: async (_itemId: number, _quantity: number) => {},
  removeFromCart: async (_itemId: number) => {},
  clearCart: async () => {},
};

// For debugging
console.log("CartContext module loaded");

interface CartContextProps {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextProps>(defaultCartContext);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Import the toast function dynamically to avoid circular dependencies
  const toast = (props: any) => {
    // Using a delayed import to avoid circular dependencies
    import('@/hooks/use-toast').then(module => {
      const { toast } = module;
      toast(props);
    }).catch(error => {
      console.error('Failed to load toast module:', error);
    });
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.product?.price || 0) * item.quantity,
    0
  );

  // Fetch cart items on load
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      } else {
        console.error("Failed to fetch cart items");
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity: number) => {
    try {
      const response = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity,
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        const data = await response.json();
        
        // Update local state optimistically
        const existingItemIndex = cartItems.findIndex(
          (item) => item.productId === product.id
        );
        
        if (existingItemIndex !== -1) {
          // Update existing item
          const updatedItems = [...cartItems];
          updatedItems[existingItemIndex].quantity += quantity;
          setCartItems(updatedItems);
        } else {
          // Add new item
          setCartItems([...cartItems, data]);
        }
        
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart.`,
        });
      } else {
        throw new Error("Failed to add to cart");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const response = await apiRequest("PATCH", `/api/cart/${itemId}`, {
        quantity,
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        
        // Update local state optimistically
        const updatedItems = cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        setCartItems(updatedItems);
      } else {
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/cart/${itemId}`);
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        
        // Update local state optimistically
        setCartItems(cartItems.filter((item) => item.id !== itemId));
        
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart.",
        });
      } else {
        throw new Error("Failed to remove from cart");
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const clearCart = async () => {
    try {
      const response = await apiRequest("DELETE", "/api/cart");
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
        
        // Update local state
        setCartItems([]);
        
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart.",
        });
      } else {
        throw new Error("Failed to clear cart");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
