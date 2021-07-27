import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  // Adicionado por mim
  useEffect(() => {
    console.log(`O cart mudou: ${JSON.stringify(cart)}`);
    
  }, [cart])

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const amountInStock = await api
        .get(`stock/${productId}`)
        .then((result) => result.data.amount);

      const productSelected = cart.find((product) => product.id === productId);

      if (!amountInStock) {
        toast.error('Quantidade solicitada fora de estoque');
        throw new Error('Quantidade solicitada fora de estoque');
      }

      if (productSelected) {
        if (productSelected.amount + 1 > amountInStock) {
          toast.error('Quantidade solicitada fora de estoque');
          throw new Error('Quantidade solicitada fora de estoque');
        }

        productSelected.amount += 1;
        setCart(products => [...products])
        return;
      }

      const productSelect = (await api
        .get(`products/${productId}`)
        .then((result) => result.data)) as Product;

      setCart((products) => [...products, { ...productSelect, amount: 1 }]);
      console.log('amount in stock', amountInStock);
    } catch {
      // TODO
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
