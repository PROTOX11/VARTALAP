import { useCallContext } from '../contexts/CallContext';

export const useCall = () => {
  return useCallContext();
};
