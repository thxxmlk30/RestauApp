import type { Order } from '../types';

export const mockOrders: Order[] = [
  {
    id: 'ord-001',
    tableNumber: 5,
    items: [
      {
        menuItemId: '1',
        name: 'Thiéboudienne',
        quantity: 2,
        price: 4500,
      },
      {
        menuItemId: '50',
        name: 'Bissap maison',
        quantity: 2,
        price: 800,
      },
    ],
    status: 'preparing',
    totalAmount: 10600,
    createdAt: new Date().toISOString(),
    customerName: 'Amadou Diallo',
  },
  {
    id: 'ord-002',
    tableNumber: 3,
    items: [
      {
        menuItemId: '2',
        name: 'Poulet Yassa',
        quantity: 1,
        price: 4000,
      },
      {
        menuItemId: '51',
        name: 'Bouye (baobab)',
        quantity: 1,
        price: 1000,
      },
    ],
    status: 'pending',
    totalAmount: 5000,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    customerName: 'Fatou Sow',
  },
  {
    id: 'ord-003',
    tableNumber: 8,
    items: [
      {
        menuItemId: '3',
        name: 'Mafé boeuf',
        quantity: 1,
        price: 4500,
      },
      {
        menuItemId: '4',
        name: 'Fataya (x3)',
        quantity: 1,
        price: 1500,
      },
      {
        menuItemId: '52',
        name: 'Jus de gingembre',
        quantity: 2,
        price: 900,
      },
    ],
    status: 'ready',
    totalAmount: 7800,
    createdAt: new Date(Date.now() - 600000).toISOString(),
    customerName: 'Moussa Ndiaye',
  },
  {
    id: 'ord-004',
    tableNumber: 12,
    items: [
      {
        menuItemId: '201',
        name: 'Poisson braisé',
        quantity: 1,
        price: 5500,
      },
      {
        menuItemId: '204',
        name: 'Pastels (x6)',
        quantity: 1,
        price: 2000,
      },
    ],
    status: 'delivered',
    totalAmount: 7500,
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    customerName: 'Aïssatou Ba',
    rating: 5,
    review: 'Excellent repas, très savoureux!',
    ratedAt: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'ord-005',
    tableNumber: 7,
    items: [
      {
        menuItemId: '202',
        name: "Dibi d'agneau",
        quantity: 2,
        price: 6500,
      },
      {
        menuItemId: '50',
        name: 'Bissap maison',
        quantity: 2,
        price: 800,
      },
    ],
    status: 'preparing',
    totalAmount: 14600,
    createdAt: new Date(Date.now() - 450000).toISOString(),
    customerName: 'Ibrahima Fall',
  },
];
