import { createContext, ReactNode, useContext, useState } from 'react';
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

  const addProduct = async (productId: number) => {
    try {
      const productSelected = cart.find((product) => product.id === productId);

      const inStock = await api
      .get(`stock/${productId}`)
      .then((result) => result.data as Stock)
      .catch(() => {
        throw new Error('Erro na adição do produto');
      });

      const amountInStock = inStock.amount;
      if (!amountInStock || amountInStock < 1) {
        throw new Error('Quantidade solicitada fora de estoque');
      }

      if (productSelected) {
        productSelected.amount += 1;
        saveCartLocalStorage(cart)
        setCart((products) => [...products]);
        return;
      }

      const productSelect = await api
        .get(`products/${productId}`)
        .then((result) => result.data as Product)
        .catch(() => {
          throw new Error('Erro na adição do produto');
        });

      const products = [...cart, { ...productSelect, amount: 1 }];
      
      setCart(products);
      saveCartLocalStorage(products)

    } catch(error) {
      toast.error(error.message);
      // toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const cartAux = Object.assign(cart);
      const productIndex = cart.findIndex(
        (product) => product.id === productId
      );
      if (productIndex === -1) {
        throw new Error('Erro na remoção do produto');
      }

      cartAux.splice(productIndex, 1);
      saveCartLocalStorage(cartAux);
      setCart([...cartAux]);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount < 1) throw new Error('Quantidade solicitada fora de estoque');

      const inStock = await api
        .get(`stock/${productId}`)
        .then((result) => result.data as Stock)
        .catch(() => {
          throw new Error('Erro na alteração de quantidade do produto');
        });

      const amountInStock = inStock.amount;
      if (!amountInStock || amount > amountInStock) {
        throw new Error('Quantidade solicitada fora de estoque');
      }

      const productSelected = cart.find((product) => product.id === productId);
      if (!productSelected) {
        throw new Error('Erro na adição do produto');
      }
      productSelected.amount = amount;

      saveCartLocalStorage(cart);
      setCart((products) => [...products]);

    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );

  function saveCartLocalStorage(cart: Product[]) {
    localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart));
  }
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
