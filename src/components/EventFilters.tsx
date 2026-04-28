import { useForm } from 'react-hook-form';
import { useFilterStore } from '@/stores';
import type { EventCategory } from '@/types';

const categories = [
  { value: 'all', label: 'Все категории' },
  { value: 'cinema', label: 'Кино' },
  { value: 'sport', label: 'Спорт' },
  { value: 'cafe', label: 'Кафе' },
  { value: 'theater', label: 'Театр' },
  { value: 'concert', label: 'Концерт' },
  { value: 'exhibition', label: 'Выставка' },
  { value: 'festival', label: 'Фестиваль' },
  { value: 'meeting', label: 'Встреча' },
  { value: 'other', label: 'Другое' },
] as const;

const EventFilters: React.FC = () => {
  const { searchQuery, category, setFilter } = useFilterStore();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      search: searchQuery,
      category: category,
    },
  });

  const onSubmit = (data: { search: string; category: EventCategory | 'all' }) => {
    setFilter('searchQuery', data.search);
    setFilter('category', data.category);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-3">
      {/* Search input */}
      <div className="flex-1">
        <input
          type="text"
          placeholder="Поиск по названию, адресу..."
          className="form-input"
          {...register('search')}
        />
      </div>

      {/* Category select */}
      <div className="w-full md:w-48">
        <select
          className="form-input"
          {...register('category')}
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Apply button */}
      <button type="submit" className="btn btn-primary">
        Применить
      </button>
    </form>
  );
};

export default EventFilters;
