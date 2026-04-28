import { categoryColors } from '@/api';

interface CategoryBadgeProps {
  category: string;
  size?: 'sm' | 'md';
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, size = 'md' }) => {
  const color = categoryColors[category as keyof typeof categoryColors] || '#6b7280';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{ backgroundColor: color }}
    >
      {category}
    </span>
  );
};

export default CategoryBadge;
