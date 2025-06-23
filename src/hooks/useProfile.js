import { useProfileContext } from '../contexts/ProfileContext';

export const useProfile = () => {
  return useProfileContext();
};

export default useProfile;