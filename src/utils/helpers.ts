import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTimeAgo = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru });
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};
