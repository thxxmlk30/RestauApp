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
import { restaurantApi, type TopItemSummary } from '../../services/restaurantApi';
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [topItems, setTopItems] = useState<TopItemSummary[]>([]);
  const [dashboardReport, setDashboardReport] = useState<null | {
    todayOrders?: number;
    todayRevenue?: number;
    deliveryOrders?: number;
    dineInOrders?: number;
    pendingOrders?: number;
    ingredientsLow?: number;
  }>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [actionError, setActionError] = useState('');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;

    if (isAdmin) {
      Promise.allSettled([
        restaurantApi.orders(),
        restaurantApi.menuItems(),
        restaurantApi.ingredients(),
        restaurantApi.staff(),
        restaurantApi.dashboardReport(),
        restaurantApi.topItems(6),
      ]).then(([ordersResult, menuResult, ingredientsResult, staffResult, reportResult, topItemsResult]) => {
        if (cancelled) return;

        if (ordersResult.status === 'fulfilled') setOrders(ordersResult.value);
        if (menuResult.status === 'fulfilled') setMenuItems(menuResult.value);
        if (ingredientsResult.status === 'fulfilled') setIngredients(ingredientsResult.value as Ingredient[]);
        if (staffResult.status === 'fulfilled') setStaff(staffResult.value as Staff[]);
        if (reportResult.status === 'fulfilled') {
          const report = reportResult.value as {
            todayOrders?: number;
            todayRevenue?: number;
            deliveryOrders?: number;
            dineInOrders?: number;
            pendingOrders?: number;
            ingredientsLow?: number;
          };
          setDashboardReport(report);
        }
        if (topItemsResult.status === 'fulfilled') setTopItems(topItemsResult.value);
      });
      return () => {
        cancelled = true;
      };
    }

    setOrders(loadOrders(mockOrders));
    setMenuItems(loadMenuItems(defaultMenuItems));
    setIngredients(loadIngredients(mockIngredients));
    setStaff(loadStaff(mockStaff));
    setTopItems([]);
    setDashboardReport(null);

    return () => {
      cancelled = true;
    };
  }, [isAdmin]);

  const toggleSidebar = useCallback(() => {
    setIsMobileSidebarOpen((open) => !open);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const reportActionError = useCallback((error: unknown, fallback = 'Action impossible.') => {
    setActionError(error instanceof Error ? error.message : fallback);
  }, []);

  const updateOrderStatus = useCallback((orderId: string, newStatus: OrderStatus) => {
    if (isAdmin) {
      void restaurantApi.updateOrderStatus(orderId, newStatus)
        .then((updatedOrder) => {
          setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setOrders((prev) => {
      const next = prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order));
      saveOrders(next);
      return next;
    });
  }, [isAdmin]);

  const deleteOrder = useCallback((orderId: string) => {
    if (isAdmin) {
      void restaurantApi.deleteOrder(orderId)
        .then(() => {
          setOrders((prev) => prev.filter((order) => order.id !== orderId));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setOrders((prev) => {
      const next = prev.filter((order) => order.id !== orderId);
      saveOrders(next);
      return next;
    });
  }, [isAdmin]);

  const assignCourier = useCallback(
    (orderId: string, staffId: string) => {
      const courier = staff.find((member) => member.id === staffId && member.role === 'delivery');
      if (!courier) return;
      if (isAdmin) {
        void restaurantApi.assignOrderCourier(orderId, courier.id, courier.name)
          .then((updatedOrder) => {
            setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
            setActionError('');
          })
          .catch((error) => reportActionError(error));
        return;
      }
      setOrders((prev) => {
        const next = prev.map((order) =>
          order.id === orderId ? { ...order, courierId: courier.id, courierName: courier.name } : order,
        );
        saveOrders(next);
        return next;
      });
    },
    [isAdmin, staff],
  );

  const assignChef = useCallback(
    (orderId: string, staffId: string) => {
      const chef = staff.find((member) => member.id === staffId && member.role === 'chef');
      if (!chef) return;
      if (isAdmin) {
        void restaurantApi.assignOrderChef(orderId, chef.id, chef.name)
          .then((updatedOrder) => {
            setOrders((prev) => prev.map((order) => (order.id === orderId ? updatedOrder : order)));
            setActionError('');
          })
          .catch((error) => reportActionError(error));
        return;
      }
      setOrders((prev) => {
        const next = prev.map((order) =>
          order.id === orderId ? { ...order, assignedChefId: chef.id, assignedChefName: chef.name } : order,
        );
        saveOrders(next);
        return next;
      });
    },
    [isAdmin, staff],
  );

  const upsertMenuItem = useCallback((item: MenuItem) => {
    if (isAdmin) {
      const request = item.id ? restaurantApi.updateMenuItem(item.id, item) : restaurantApi.createMenuItem(item);
      void request
        .then((savedItem) => {
          setMenuItems((prev) => (item.id ? prev.map((current) => (current.id === savedItem.id ? savedItem : current)) : [savedItem, ...prev]));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setMenuItems((prev) => {
      const next = prev.some((current) => current.id === item.id)
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [item, ...prev];
      saveMenuItems(next);
      return next;
    });
  }, [isAdmin]);

  const deleteMenuItem = useCallback((itemId: string) => {
    if (isAdmin) {
      void restaurantApi.deleteMenuItem(itemId)
        .then(() => {
          setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setMenuItems((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      saveMenuItems(next);
      return next;
    });
  }, [isAdmin]);

  const toggleMenuItemAvailability = useCallback((itemId: string) => {
    if (isAdmin) {
      const current = menuItems.find((item) => item.id === itemId);
      if (!current) return;
      void restaurantApi.updateMenuItem(itemId, { available: !current.available })
        .then((savedItem) => {
          setMenuItems((prev) => prev.map((item) => (item.id === itemId ? savedItem : item)));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setMenuItems((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, available: !item.available } : item));
      saveMenuItems(next);
      return next;
    });
  }, [isAdmin, menuItems]);

  const upsertIngredient = useCallback((item: Ingredient) => {
    if (isAdmin) {
      const request = item.id ? restaurantApi.updateIngredient(item.id, item) : restaurantApi.createIngredient(item);
      void request
        .then((savedItem) => {
          setIngredients((prev) => (item.id ? prev.map((current) => (current.id === savedItem.id ? savedItem : current)) : [savedItem, ...prev]));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setIngredients((prev) => {
      const next = prev.some((current) => current.id === item.id)
        ? prev.map((current) => (current.id === item.id ? item : current))
        : [item, ...prev];
      saveIngredients(next);
      return next;
    });
  }, [isAdmin]);

  const replaceIngredients = useCallback((items: Ingredient[]) => {
    setIngredients(items);
    saveIngredients(items);
  }, []);

  const deleteIngredient = useCallback((itemId: string) => {
    if (isAdmin) {
      void restaurantApi.deleteIngredient(itemId)
        .then(() => {
          setIngredients((prev) => prev.filter((item) => item.id !== itemId));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setIngredients((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      saveIngredients(next);
      return next;
    });
  }, [isAdmin]);

  const adjustIngredientStock = useCallback((itemId: string, delta: number) => {
    if (isAdmin) {
      const current = ingredients.find((item) => item.id === itemId);
      if (!current) return;
      void restaurantApi.updateIngredient(itemId, {
        ...current,
        currentStock: Math.max(0, Number((current.currentStock + delta).toFixed(1))),
        lastRestockedAt: delta > 0 ? new Date().toISOString() : current.lastRestockedAt,
      })
        .then((savedItem) => {
          setIngredients((prev) => prev.map((item) => (item.id === itemId ? savedItem : item)));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

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
  }, [ingredients, isAdmin]);

  const upsertStaff = useCallback((member: Staff) => {
    if (isAdmin) {
      const request = member.id ? restaurantApi.updateStaff(member.id, member) : restaurantApi.createStaff(member);
      void request
        .then((savedMember) => {
          setStaff((prev) => (member.id ? prev.map((current) => (current.id === savedMember.id ? savedMember : current)) : [savedMember, ...prev]));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setStaff((prev) => {
      const next = prev.some((current) => current.id === member.id)
        ? prev.map((current) => (current.id === member.id ? member : current))
        : [member, ...prev];
      saveStaff(next);
      return next;
    });
  }, [isAdmin]);

  const deleteStaff = useCallback((staffId: string) => {
    if (isAdmin) {
      void restaurantApi.deleteStaff(staffId)
        .then(() => {
          setStaff((prev) => prev.filter((member) => member.id !== staffId));
          setActionError('');
        })
        .catch((error) => reportActionError(error));
      return;
    }

    setStaff((prev) => {
      const next = prev.filter((member) => member.id !== staffId);
      saveStaff(next);
      return next;
    });
  }, [isAdmin]);

  const updateStaffStatus = useCallback((staffId: string, status: StaffStatus) => {
    if (isAdmin) {
      const member = staff.find((item) => item.id === staffId);
      if (!member) return;
      void restaurantApi.updateStaff(staffId, { ...member, status }).then((savedMember) => {
        setStaff((prev) => prev.map((current) => (current.id === staffId ? savedMember : current)));
      });
      return;
    }

    setStaff((prev) => {
      const next = prev.map((member) => (member.id === staffId ? { ...member, status } : member));
      saveStaff(next);
      return next;
    });
  }, [isAdmin, staff]);

  const stats = useMemo(() => {
    if (isAdmin && dashboardReport) {
      return {
        todayOrders: dashboardReport.todayOrders ?? 0,
        todayRevenue: dashboardReport.todayRevenue ?? 0,
        occupiedTables: orders.filter((order) => order.serviceType === 'dine_in' && order.status !== 'delivered' && order.status !== 'cancelled').length,
        totalTables: Math.max(orders.filter((order) => order.serviceType === 'dine_in').length, 1),
        pendingOrders: dashboardReport.pendingOrders ?? 0,
        ingredientsLow: dashboardReport.ingredientsLow ?? 0,
        deliveryOrders: dashboardReport.deliveryOrders ?? 0,
        dineInOrders: dashboardReport.dineInOrders ?? 0,
        activeCouriers: staff.filter((member) => member.role === 'delivery' && member.status === 'active').length,
      };
    }

    return buildDashboardStats(orders, ingredients, staff);
  }, [dashboardReport, ingredients, isAdmin, orders, staff]);
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
      topItems,
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
      topItems,
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
        {actionError ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {actionError}
          </div>
        ) : null}
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
