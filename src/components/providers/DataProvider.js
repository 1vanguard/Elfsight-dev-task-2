import axios from 'axios';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';
import { loadFilterOptions } from '../utils/fetchFilterOptions';

const API_URL = 'https://rickandmortyapi.com/api/character/';
const MAX_429_RETRIES = 2;
const RETRY_DELAY = 3000;

export function DataProvider({ children }) {
  const [activePage, setActivePage] = useState(0);
  const [characters, setCharacters] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [info, setInfo] = useState({});
  const [apiURL, setApiURL] = useState(API_URL);
  const [isRateLimited, setIsRateLimited] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    status: [],
    gender: [],
    species: []
  });
  const [isFilterOptionsLoading, setIsFilterOptionsLoading] = useState(true);

  // ✅ Загрузка опций фильтров с кэшированием + статус загрузки
  useEffect(() => {
    let isMounted = true; // 🔹 Защита от обновления размонтированного компонента

    const loadOptions = async () => {
      try {
        const options = await loadFilterOptions(); // из utils/fetchFilterOptions.js

        if (isMounted) {
          setFilterOptions(options);
          setIsFilterOptionsLoading(false); // ✅ Загрузка завершена
        }
      } catch (e) {
        console.error('❌ Failed to load filter options:', e);

        if (isMounted) {
          // 🔹 Фолбэк на минимальный набор
          setFilterOptions({
            status: ['Alive', 'Dead', 'unknown'],
            gender: ['Male', 'Female', 'Genderless', 'unknown'],
            species: ['Human', 'Alien', 'Robot', 'unknown']
          });
          setIsFilterOptionsLoading(false);
        }
      }
    };

    loadOptions();

    // 🔹 Cleanup при размонтировании
    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Синхронизация с URL при старте
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const gender = params.get('gender');
    const species = params.get('species');
    const name = params.get('name');
    const type = params.get('type');

    if (status || gender || species || name || type) {
      const url = new URL(API_URL);
      if (status) url.searchParams.set('status', status);
      if (gender) url.searchParams.set('gender', gender);
      if (species) url.searchParams.set('species', species);
      if (name) url.searchParams.set('name', name);
      if (type) url.searchParams.set('type', type);
      setApiURL(url.toString().trim());
    }
  }, []);

  const fetchData = useCallback(async (url) => {
    // ✅ Сброс всех флагов перед новым запросом
    setIsRateLimited(false);
    setIsError(false);
    setIsFetching(true);

    console.log('🔄 Fetching data:', url);

    try {
      const { data } = await axios.get(url.trim(), {
        timeout: 15000,
        headers: { Accept: 'application/json' },
        validateStatus: (status) => status === 200
      });

      // Обработка 404 (пустой результат)
      if (data?.error) {
        console.log('📭 No results found:', url);
        setCharacters([]);
        setInfo({ count: 0, pages: 0, next: null, prev: null });
        setIsFetching(false);

        return;
      }

      // Валидация успешного ответа
      if (!data?.results || !Array.isArray(data.results)) {
        throw new Error('Invalid API response format');
      }

      console.log('✅ Data loaded:', data.results.length, 'characters');
      setCharacters(data.results);
      setInfo(data.info);
      setIsFetching(false);
    } catch (e) {
      // Обработка 429
      if (e.response?.status === 429) {
        console.warn('⚠️ 429 Too Many Requests');

        const retryCount = e.config?.__429RetryCount || 0;

        if (retryCount < MAX_429_RETRIES) {
          console.log(`⏳ Waiting ${RETRY_DELAY}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          e.config.__429RetryCount = retryCount + 1;
          fetchData(url); // Рекурсивный retry

          return;
        } else {
          // Финальный 429
          console.error('❌ 429 after all retries');
          setIsRateLimited(true); // 🔹 Ставим флаг
          setIsError(true);
          setIsFetching(false);

          return;
        }
      }

      // Другие ошибки
      console.error('❌ Fetch error:', e.message);
      setIsError(true);
      setIsFetching(false);
    }
  }, []); // ✅ Пустой массив зависимостей

  // ✅ Вызываем загрузку при изменении apiURL
  useEffect(() => {
    fetchData(apiURL);
  }, [apiURL, fetchData]);

  const dataValue = useMemo(
    () => ({
      activePage,
      setActivePage,
      apiURL,
      setApiURL,
      characters,
      fetchData,
      isFetching,
      isError,
      info,
      filterOptions,
      isFilterOptionsLoading,
      isRateLimited
    }),
    [
      activePage,
      apiURL,
      characters,
      isFetching,
      isError,
      info,
      fetchData,
      filterOptions,
      isFilterOptionsLoading,
      isRateLimited
    ]
  );

  return (
    <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>
  );
}

const DataContext = createContext({});

export const useData = () => useContext(DataContext);
