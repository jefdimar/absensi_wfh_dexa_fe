import { useState, useEffect, useCallback } from 'react';

// Generic API hook
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  return {
    data,
    loading,
    error,
    execute
  };
};

// Hook for API calls that should run on mount
export const useApiEffect = (apiFunction, dependencies = []) => {
  const { data, loading, error, execute } = useApi(apiFunction, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    refetch: execute
  };
};

// Hook for mutations (POST, PUT, DELETE)
export const useMutation = (apiFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  return {
    mutate,
    loading,
    error
  };
};