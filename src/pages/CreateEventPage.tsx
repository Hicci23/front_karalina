import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { eventsApi } from '@/api';
import { useMapStore } from '@/stores';
import type { CreateEventData } from '@/types';
import YandexMap from '@/components/YandexMap';

const categories = [
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

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCoordinates, selectedPlace, setSelectedPlace, setCoordinatesFromAddress } = useMapStore();

  const initialCoordinates = location.state?.coordinates || selectedCoordinates || [55.751244, 37.618423];
  const initialAddress = location.state?.address || selectedPlace || '';

  const [coordinates, setCoordinates] = useState<[number, number]>(initialCoordinates as [number, number]);
  const [address, setAddress] = useState(initialAddress);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateEventData>();

  useEffect(() => {
    setValue('coordinates', { lat: coordinates[0], lng: coordinates[1] });
    setValue('address', address);
  }, [coordinates, address, setValue]);

  const onSubmit = async (data: CreateEventData) => {
    try {
      const response = await eventsApi.create({
        ...data,
        coordinates: { lat: coordinates[0], lng: coordinates[1] },
      });
      if (response.success && response.data) {
        navigate(`/events/${response.data.id}`);
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleAddressSearch = async () => {
    if (address) {
      await setCoordinatesFromAddress(address);
      const coords = useMapStore.getState().selectedCoordinates;
      if (coords) {
        setCoordinates(coords as [number, number]);
      }
    }
  };

  const handleMapClick = (coords: [number, number]) => {
    setCoordinates(coords);
    setAddress('');
    setSelectedPlace('Выбранная точка', coords);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Создать событие</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Map */}
        <div className="h-[500px] rounded-lg overflow-hidden shadow-md">
          <YandexMap
            center={coordinates}
            zoom={15}
            height="100%"
            onMapClick={handleMapClick}
          />
        </div>

        {/* Form */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Название события *
              </label>
              <input
                type="text"
                id="title"
                className={`form-input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Например: Вечерний киноман"
                {...register('title', { required: 'Название обязательно' })}
              />
              {errors.title && <p className="form-error">{errors.title.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Описание
              </label>
              <textarea
                id="description"
                className={`form-input textarea ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Расскажите о своём событии..."
                rows={4}
                {...register('description')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="date_time" className="form-label">
                  Дата и время *
                </label>
                <input
                  type="datetime-local"
                  id="date_time"
                  className={`form-input ${errors.date_time ? 'border-red-500' : ''}`}
                  {...register('date_time', {
                    required: 'Укажите дату и время',
                    validate: (value) => new Date(value) > new Date() || 'Дата должна быть в будущем',
                  })}
                />
                {errors.date_time && <p className="form-error">{errors.date_time.message}</p>}
              </div>

              <div className="form-group">
                <label htmlFor="max_participants" className="form-label">
                  Макс. участников *
                </label>
                <input
                  type="number"
                  id="max_participants"
                  className={`form-input ${errors.max_participants ? 'border-red-500' : ''}`}
                  min={1}
                  max={1000}
                  {...register('max_participants', {
                    required: 'Укажите максимальное количество',
                    min: { value: 1, message: 'Минимум 1 участник' },
                    valueAsNumber: true,
                  })}
                />
                {errors.max_participants && <p className="form-error">{errors.max_participants.message}</p>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Категория *
              </label>
              <select
                id="category"
                className={`form-input ${errors.category ? 'border-red-500' : ''}`}
                {...register('category', { required: 'Выберите категорию' })}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && <p className="form-error">{errors.category.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Адрес
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="address"
                  className="form-input flex-1"
                  placeholder="Введите адрес для поиска"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="btn btn-outline"
                >
                  Найти
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Координаты</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  className="form-input flex-1"
                  value={coordinates[0]}
                  onChange={(e) => setCoordinates([Number(e.target.value), coordinates[1]])}
                  placeholder="Широта"
                />
                <input
                  type="number"
                  step="any"
                  className="form-input flex-1"
                  value={coordinates[1]}
                  onChange={(e) => setCoordinates([coordinates[0], Number(e.target.value)])}
                  placeholder="Долгота"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Кликните на карте или введите адрес для выбора места
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline flex-1"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                Создать событие
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
