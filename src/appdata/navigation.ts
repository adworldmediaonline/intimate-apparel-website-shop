export interface NavLink {
  href: string;
  label: string;
}

// Primary navigation links used in both desktop and mobile menus (excluding the Shop dropdown)
export const PRIMARY_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/shop', label: 'Products' },
  { href: '/contact', label: 'Contact' },
];
