import { menuItems } from '../../data/menuItems';
import { loadMenuItems } from '../../utils/storage';

export default function MenuList() {
  const items = loadMenuItems(menuItems);
  
  const categories = ['entree', 'plat', 'dessert', 'boisson'] as const;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <h2 className="font-bold text-secondary-900 mb-4">Menu du restaurant</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                {cat === 'entree' ? 'Entrées' : cat === 'plat' ? 'Plats' : cat === 'dessert' ? 'Desserts' : 'Boissons'}
              </h3>
              <ul className="space-y-2">
                {catItems.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-secondary-900">{item.name}</span>
                    <span className="font-medium text-primary-500">{item.price} frs</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
