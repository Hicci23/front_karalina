import { useState } from 'react';
import { useFilterStore } from '@/stores';

export const categories = ['Общение', 'Настольные игры', 'Книжный клуб', 'Кофе', 'Спорт', 'Прогулка'];

const EventFilters = () => {
  const { query, category, setQuery, setCategory } = useFilterStore();
  const [isExpanded, setIsExpanded] = useState(true);

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
      <button
        type="button"
        className={`icon-button ${isExpanded ? 'icon-button--active' : ''}`}
        aria-label="Фильтры"
        aria-pressed={isExpanded}
        title="Фильтры"
        onClick={() => setIsExpanded((value) => !value)}
      >
        <span className="sliders-icon" />
      </button>
      {isExpanded && (
        <div className="chips">
          <button type="button" className={!category ? 'chip chip--active' : 'chip'} onClick={() => setCategory('')}>
            Все
          </button>
          {categories.map((item) => (
            <button
              type="button"
              key={item}
              className={category === item ? 'chip chip--active' : 'chip'}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventFilters;
