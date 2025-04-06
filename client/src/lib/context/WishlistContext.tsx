import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { WishlistItem, Product } from "../types";
import { apiRequest } from "../queryClient";
import { queryClient } from "../queryClient";

// Create a default context value to avoid runtime errors
const defaultWishlistContext = {
  wishlistItems: [] as WishlistItem[],
  wishlistCount: 0,
  isLoading: false,
  addToWishlist: async (_product: Product) => {},
  removeFromWishlist: async (_itemId: number) => {},
  isInWishlist: (_productId: number) => false,
};

// For debugging
console.log("WishlistContext module loaded");

interface WishlistContextProps {
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  isLoading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (itemId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

const WishlistContext = createContext<WishlistContextProps>(defaultWishlistContext);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}

interface WishlistProviderProps {
  children: ReactNode;
}

export function WishlistProvider({ children }: WishlistProviderProps) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
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

  const wishlistCount = wishlistItems.length;

  // Fetch wishlist items on load
  useEffect(() => {
    fetchWishlistItems();
  }, []);

  const fetchWishlistItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/wishlist", {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data);
      } else {
        console.error("Failed to fetch wishlist items");
      }
    } catch (error) {
      console.error("Error fetching wishlist items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToWishlist = async (product: Product) => {
    // Check if product is already in wishlist
    if (isInWishlist(product.id)) {
      toast({
        title: "Already in wishlist",
        description: `${product.name} is already in your wishlist.`,
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/wishlist", {
        productId: product.id,
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
        const data = await response.json();
        
        // Update local state
        setWishlistItems([...wishlistItems, data]);
        
        toast({
          title: "Added to wishlist",
          description: `${product.name} has been added to your wishlist.`,
        });
      } else {
        throw new Error("Failed to add to wishlist");
      }
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to add item to wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    try {
      const response = await apiRequest("DELETE", `/api/wishlist/${itemId}`);
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
        
        // Update local state
        setWishlistItems(wishlistItems.filter((item) => item.id !== itemId));
        
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist.",
        });
      } else {
        throw new Error("Failed to remove from wishlist");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some((item) => item.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}
