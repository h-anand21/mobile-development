import { create } from 'zustand';

export type OrderStatus = 'ongoing' | 'completed' | 'cancelled';

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface Order {
  id: string;
  orderId: string;
  productName: string;
  items: OrderItem[];
  totalPrice: number;
  status: OrderStatus;
  date: string;
  time: string;
  image: any;
  restaurantName: string;
}

interface OrderStore {
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'orderId' | 'date' | 'time' | 'status'>) => void;
  cancelOrder: (id: string) => void;
  clearOrders: () => void;
}

let orderCounter = 12580;

function getOrderId() {
  return `#FD${orderCounter++}`;
}

function getNow() {
  const now = new Date();
  const date = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  return { date, time };
}

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],

  placeOrder: (order) => {
    const { date, time } = getNow();
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      orderId: getOrderId(),
      date,
      time,
      status: 'ongoing',
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
  },

  cancelOrder: (id) =>
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status: 'cancelled' } : o
      ),
    })),

  clearOrders: () => set({ orders: [] }),
}));
