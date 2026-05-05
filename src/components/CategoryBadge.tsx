interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge = ({ category }: CategoryBadgeProps) => (
  <span className="category-badge">{category}</span>
);

export default CategoryBadge;
