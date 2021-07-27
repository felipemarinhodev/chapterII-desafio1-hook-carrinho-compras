import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
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

  useEffect(() => {
    if (cart) {
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(cart))
    }
    console.log(`O cart mudou: ${JSON.stringify(cart)}`);
  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const productSelected = cart.find((product) => product.id === productId);
      await checkIfHasProductInStock(productId, productSelected?.amount);

      if (productSelected) {
        productSelected.amount += 1;
        setCart((products) => [...products]);
        return;
      }

      const productSelect = (await api
        .get(`products/${productId}`)
        .then((result) => result.data)) as Product;

      setCart((products) => [...products, { ...productSelect, amount: 1 }]);
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
      const productSelected = cart.find((product) => product.id === productId);
      await checkIfHasProductInStock(productId, productSelected?.amount);

      if (productSelected) {
        productSelected.amount += 1;
        setCart((products) => [...products]);
        return;
      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
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

async function checkIfHasProductInStock(productId: number, amount: number = 0) {
  const amountInStock = await api
    .get(`stock/${productId}`)
    .then((result) => result.data.amount);

  if (!amountInStock || amount + 1 > amountInStock) {
    toast.error('Quantidade solicitada fora de estoque');
    throw new Error('Quantidade solicitada fora de estoque');
  }
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
