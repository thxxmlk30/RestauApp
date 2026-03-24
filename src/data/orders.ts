import type { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'CMD-001',
    tableNumber: 5,
    status: 'pending',
    totalAmount: 8500,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
    customerName: 'Mamadou',
    items: [
      { menuItemId: '1', name: 'Thiéboudienne', quantity: 1, price: 4500 },
      { menuItemId: '50', name: 'Bissap maison', quantity: 2, price: 800 },
      { menuItemId: '54', name: 'Soda 33cl', quantity: 2, price: 700 },
    ],
  },
  {
    id: 'CMD-002',
    tableNumber: 12,
    status: 'preparing',
    totalAmount: 12000,
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    customerName: 'Fatou',
    items: [
      { menuItemId: '2', name: 'Poulet Yassa', quantity: 2, price: 4000 },
      { menuItemId: '51', name: 'Bouye (baobab)', quantity: 2, price: 1000 },
    ],
  },
  {
    id: 'CMD-003',
    tableNumber: 3,
    status: 'ready',
    totalAmount: 5500,
    createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
    customerName: 'Aliou',
    items: [
      { menuItemId: '201', name: 'Poisson braisé', quantity: 1, price: 5500 },
    ],
  },
  {
    id: 'CMD-004',
    tableNumber: 8,
    status: 'delivered',
    totalAmount: 9200,
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    customerName: 'Mariama',
    items: [
      { menuItemId: '3', name: 'Mafé boeuf', quantity: 1, price: 4500 },
      { menuItemId: '5', name: "Salade d'avocat", quantity: 1, price: 2000 },
      { menuItemId: '52', name: 'Jus de gingembre', quantity: 2, price: 900 },
      { menuItemId: '54', name: 'Soda 33cl', quantity: 1, price: 700 },
    ],
  },
  {
    id: 'CMD-005',
    tableNumber: 15,
    status: 'cancelled',
    totalAmount: 4000,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    customerName: 'Moussa',
    items: [
      { menuItemId: '4', name: 'Fataya (x3)', quantity: 1, price: 1500 },
      { menuItemId: '202', name: "Dibi d'agneau", quantity: 1, price: 6500 },
    ],
  },
];
