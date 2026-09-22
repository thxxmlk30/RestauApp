const modules = import.meta.glob('../assets/*.{webp,jpg,jpeg,png}', { eager: true, import: 'default' }) as Record<string, string>;

export interface MenuImageOption {
  label: string;
  url: string;
}

export const menuImageOptions: MenuImageOption[] = Object.entries(modules)
  .map(([path, url]) => {
    const filename = path.split('/').pop() ?? path;
    const label = filename.replace(/\.[^.]+$/, '');
    return { label, url };
  })
  .sort((a, b) => a.label.localeCompare(b.label, 'fr'));
