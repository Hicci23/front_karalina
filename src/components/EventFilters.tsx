import { useFilterStore } from '@/stores';

export const categories = ['Общение', 'Настольные игры', 'Книжный клуб', 'Кофе', 'Спорт', 'Прогулка'];

const EventFilters = () => {
  const { query, category, setQuery, setCategory } = useFilterStore();

  return (
    <div className="search-panel">
      <div className="search-input">
        <span>⌕</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск событий"
        />
      </div>
      <button className="icon-button" aria-label="Фильтры" title="Фильтры">
        <span className="sliders-icon" />
      </button>
      <div className="chips">
        <button className={!category ? 'chip chip--active' : 'chip'} onClick={() => setCategory('')}>
          Все
        </button>
        {categories.map((item) => (
          <button
            key={item}
            className={category === item ? 'chip chip--active' : 'chip'}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EventFilters;
