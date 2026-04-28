import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useEventActions = () => {
  const queryClient = useQueryClient();

  const handleJoin = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [queryClient]);

  const handleLeave = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [queryClient]);

  const handleCreate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['events'] });
  }, [queryClient]);

  return {
    handleJoin,
    handleLeave,
    handleCreate,
  };
};
