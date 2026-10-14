"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface CartItem {
  id: string; // Unique cart line item ID
  menuItemId?: string; // Originating product item ID
  slug?: string;
  name: string;
  price: number; // Unit price including options
  basePrice?: number;
  quantity: number;
  image?: string;
  category?: string;
  selectedOptionIds?: string[]; // IDs only, not prices, per spec
  selectedOptionsMap?: Record<string, string[]>;
  selectedModifiers?: string[]; // Human-readable labels for badges
  specialInstructions?: string; // Max 200 chars per FR-ORD-006
  notes?: string;
}

interface VersionedCartStorage {
  version: number;
  items: CartItem[];
  updatedAt: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    item: Omit<CartItem, "quantity">,
    quantity?: number,
    options?: { openDrawer?: boolean },
  ) => void;
  updateCartItem: (id: string, updates: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  findItemByOptions: (
    menuItemId: string,
    selectedOptionIds?: string[],
  ) => CartItem | undefined;
  generateCheckoutIdempotencyKey: () => string;
  totalItems: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "cafe_cart_items_v2";
const LEGACY_STORAGE_KEY = "cafe_cart_items";
const CURRENT_VERSION = 2;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Load cart from localStorage on mount with versioning & migration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: VersionedCartStorage = JSON.parse(saved);
        if (parsed.version === CURRENT_VERSION && Array.isArray(parsed.items)) {
          setItems(parsed.items);
          return;
        }
      }

      // Check legacy storage migration
      const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacySaved) {
        const legacyItems = JSON.parse(legacySaved);
        if (Array.isArray(legacyItems)) {
          const migrated: CartItem[] = legacyItems.map((it) => ({
            ...it,
            menuItemId: it.menuItemId || it.id,
            selectedOptionIds: it.selectedOptionIds || [],
          }));
          setItems(migrated);
        }
      }
    } catch {
      // Ignore storage errors on restricted environments
    }
  }, []);

  // Save cart changes to localStorage with version metadata
  useEffect(() => {
    try {
      const payload: VersionedCartStorage = {
        version: CURRENT_VERSION,
        items,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  const findItemByOptions = useCallback(
    (menuItemId: string, selectedOptionIds: string[] = []) => {
      const sortedSearch = [...selectedOptionIds].sort().join("|");
      return items.find((i) => {
        const itemTarget = i.menuItemId || i.id;
        if (itemTarget !== menuItemId) return false;
        const currentSorted = [...(i.selectedOptionIds || [])].sort().join("|");
        return currentSorted === sortedSearch;
      });
    },
    [items],
  );

  const addItem = useCallback(
    (
      item: Omit<CartItem, "quantity">,
      quantity = 1,
      options: { openDrawer?: boolean } = { openDrawer: true },
    ) => {
      const menuItemId = item.menuItemId || item.id;
      const sortedNewOptions = [...(item.selectedOptionIds || [])]
        .sort()
        .join("|");

      setItems((prev) => {
        // Match existing item with identical item ID, option selections, and special instructions
        const existingIndex = prev.findIndex((i) => {
          const existingTarget = i.menuItemId || i.id;
          if (existingTarget !== menuItemId) return false;
          const existingSorted = [...(i.selectedOptionIds || [])]
            .sort()
            .join("|");
          const sameOptions = existingSorted === sortedNewOptions;
          const sameInstructions =
            (i.specialInstructions || "").trim() ===
            (item.specialInstructions || "").trim();
          return sameOptions && sameInstructions;
        });

        if (existingIndex > -1) {
          const current = prev[existingIndex];
          if (current) {
            const next = [...prev];
            next[existingIndex] = {
              ...current,
              quantity: current.quantity + quantity,
            };
            return next;
          }
        }

        // New line item: ensure unique composite ID if it had options
        const uniqueLineId =
          item.selectedOptionIds && item.selectedOptionIds.length > 0
            ? `${menuItemId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
            : item.id;

        const newItem: CartItem = {
          ...item,
          id: uniqueLineId,
          menuItemId,
          quantity,
        };
        return [...prev, newItem];
      });

      setLastAddedItem({
        ...item,
        quantity,
      });

      if (options.openDrawer) {
        setIsCartOpen(true);
      }

      // Auto-clear toast trigger after 4s
      setTimeout(() => {
        setLastAddedItem(null);
      }, 4000);
    },
    [],
  );

  const updateCartItem = useCallback(
    (id: string, updates: Partial<CartItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
      );
    },
    [removeItem],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // FR-ORD-009: Generate an idempotency key when checkout starts
  const generateCheckoutIdempotencyKey = useCallback(() => {
    return `ord-idem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.085;
  const deliveryFee = subtotal > 0 ? (subtotal > 45 ? 0 : 3.5) : 0;
  const total = subtotal + tax + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateCartItem,
        removeItem,
        updateQuantity,
        clearCart,
        findItemByOptions,
        generateCheckoutIdempotencyKey,
        totalItems,
        subtotal,
        tax,
        deliveryFee,
        total,
        isCartOpen,
        setIsCartOpen,
        lastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
