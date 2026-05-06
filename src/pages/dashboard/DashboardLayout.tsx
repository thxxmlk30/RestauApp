import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ChefHat, LogOut, Menu } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { mockIngredients } from '../../data/ingredients';
import { menuItems as defaultMenuItems } from '../../data/menuItems';
import { mockOrders } from '../../data/orders';
import { mockStaff } from '../../data/staff';
import type { Ingredient, MenuItem, Order, OrderStatus, Staff, StaffStatus } from '../../types';
import { buildDashboardStats, formatRole } from '../../utils/helpers';
import {
  loadIngredients,
  loadMenuItems,
  loadOrders,
  loadStaff,
  saveIngredients,
  saveMenuItems,
  saveOrders,
  saveStaff,
} from '../../utils/storage';
import type { DashboardOutletContext, DashboardStatusOption } from './dashboardOutletContext';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [orders, setOrders] = useState<Order[]>(() => loadOrders(mockOrders));
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => loadMenuItems(defaultMenuItems));
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => loadIngredients(mockIngredients));
  const [staff, setStaff] = useState<Staff[]>(() => loadStaff(mockStaff));
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = useCallback(() => {
    setIsMobileSidebarOpen((open) => !open);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order));
      saveOrders(next);
      return next;
    });
  }, []);

  const deleteOrder = useCallback((orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((order) => order.id !== orderId);
      saveOrders(next);
      return next;
    });
  }, []);

  const assignCourier = useCallback(
    (orderId: string, staffId: string) => {
      const courier = staff.find((member) => member.id === staffId && member.role === 'delivery');
      if (!courier) return;
      setOrders((prev) => {
        const next = prev.map((order) =>
          order.id === orderId ? { ...order, courierId: courier.id, courierName: courier.name } : order,
        );
        saveOrders(next);
        return next;
      });
    },
    [staff],
  );

  const assignChef = useCallback(
    (orderId: string, staffId: string) => {
      const chef = staff.find((member) => member.id === staffId && member.role === 'chef');
      if (!chef) return;
      setOrders((prev) => {
        const next = prev.map((order) =>
          order.id === orderId ? { ...order, assignedChefId: chef.id, assignedChefName: chef.name } : order,
        );
        saveOrders(next);
        return next;
      });
    },
    [staff],
  );

  const upsertMenuItem = useCallback((item: MenuItem) => {
    setMenuItems((prev) => {
      const next = prev.some((current) => current.id === item.id)
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [item, ...prev];
      saveMenuItems(next);
      return next;
    });
  }, []);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      saveMenuItems(next);
      return next;
    });
  }, []);

  const toggleMenuItemAvailability = useCallback((itemId: string) => {
    setMenuItems((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item));
      saveMenuItems(next);
      return next;
    });
  }, []);

  const upsertIngredient = useCallback((item: Ingredient) => {
    setIngredients((prev) => {
      const next = prev.some((current) => current.id === item.id)
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [item, ...prev];
      saveIngredients(next);
      return next;
    });
  }, []);

  const replaceIngredients = useCallback((items: Ingredient[]) => {
    setIngredients(items);
    saveIngredients(items);
  }, []);

  const deleteIngredient = useCallback((itemId: string) => {
    setIngredients((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      saveIngredients(next);
      return next;
    });
  }, []);

  const adjustIngredientStock = useCallback((itemId: string, delta: number) => {
    setIngredients((prev) => {
      const next = prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              currentStock: Math.max(0, Number((item.currentStock + delta).toFixed(1))),
              lastRestockedAt: delta > 0 ? new Date().toISOString() : item.lastRestockedAt,
            }
          : item,
      );
      saveIngredients(next);
      return next;
    });
  }, []);

  const upsertStaff = useCallback((member: Staff) => {
    setStaff((prev) => {
      const next = prev.some((current) => current.id === member.id)
        ? prev.map((current) => (current.id === member.id ? member : current))
        : [member, ...prev];
      saveStaff(next);
      return next;
    });
  }, []);

  const deleteStaff = useCallback((staffId: string) => {
    setStaff((prev) => {
      const next = prev.filter((member) => member.id !== staffId);
      saveStaff(next);
      return next;
    });
  }, []);

  const updateStaffStatus = useCallback((staffId: string, status: StaffStatus) => {
    setStaff((prev) => {
      const next = prev.map((member) => (member.id === staffId ? { ...member, status } : member));
      saveStaff(next);
      return next;
    });
  }, []);

  const stats = useMemo(() => buildDashboardStats(orders, ingredients, staff), [ingredients, orders, staff]);
  const preparingCount = useMemo(() => orders.filter((order) => order.status === 'preparing').length, [orders]);

  const statusOptions: DashboardStatusOption[] = useMemo(
    () => [
      { value: 'pending', label: 'En attente' },
      { value: 'preparing', label: 'En cuisine' },
      { value: 'ready', label: 'Prete' },
      { value: 'delivered', label: 'Livree' },
      { value: 'cancelled', label: 'Annulee' },
    ],
    [],
  );

  const outletContext: DashboardOutletContext = useMemo(
    () => ({
      orders,
      menuItems,
      ingredients,
      staff,
      stats,
      preparingCount,
      statusOptions,
      updateOrderStatus,
      deleteOrder,
      assignCourier,
      assignChef,
      upsertMenuItem,
      deleteMenuItem,
      toggleMenuItemAvailability,
      upsertIngredient,
      replaceIngredients,
      deleteIngredient,
      adjustIngredientStock,
      upsertStaff,
      deleteStaff,
      updateStaffStatus,
    }),
    [
      adjustIngredientStock,
      assignChef,
      assignCourier,
      deleteIngredient,
      deleteMenuItem,
      deleteOrder,
      deleteStaff,
      ingredients,
      menuItems,
      orders,
      preparingCount,
      staff,
      stats,
      statusOptions,
      toggleMenuItemAvailability,
      updateOrderStatus,
      updateStaffStatus,
      replaceIngredients,
      upsertIngredient,
      upsertMenuItem,
      upsertStaff,
    ],
  );

  return (
    <div className="min-h-screen bg-[#fcfbfa]">
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-10 w-10 rounded-2xl p-0 lg:hidden" onClick={toggleSidebar}>
              <Menu size={18} />
            </Button>
            <div className="soft-3d flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-500 text-white">
              <ChefHat size={18} />
            </div>
            <div>
              <div className="font-display text-base font-bold text-secondary-900">Linguere Ops</div>
              <div className="text-xs text-gray-500">{user ? formatRole(user.role) : 'Equipe'}</div>
            </div>
          </div>

          <div className="hidden flex-1 items-center justify-center xl:flex">
            <Input placeholder="Recherche rapide: commandes, stocks, personnel..." className="max-w-md rounded-2xl" />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-gray-100 bg-white px-4 py-2 text-right shadow-sm md:block">
              <div className="text-xs text-gray-500">Connecte</div>
              <div className="text-sm font-semibold text-secondary-900">{user?.name}</div>
            </div>
            <Button variant="outline" size="sm" className="rounded-2xl" onClick={handleLogout}>
              <LogOut size={14} className="mr-1.5" />
              Deconnexion
            </Button>
          </div>
        </div>
      </header>

      {isMobileSidebarOpen ? (
        <div className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      ) : null}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Sidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
          <div className="min-w-0">
            <Outlet context={outletContext} />
          </div>
        </div>
      </main>
    </div>
  );
}
