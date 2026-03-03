import axios from 'axios';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback
} from 'react';

const API_URL = 'https://rickandmortyapi.com/api/character/';

export function DataProvider({ children }) {
  const [activePage, setActivePage] = useState(0);
  const [characters, setCharacters] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isError, setIsError] = useState(false);
  const [info, setInfo] = useState({});
  const [apiURL, setApiURL] = useState(API_URL);

  const [filterOptions, setFilterOptions] = useState({
    status: [],
    gender: [],
    species: []
  });

  // ✅ 1. Загрузка опций фильтров: ПОСЛЕДОВАТЕЛЬНО с задержкой + кэш
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // 🔹 Проверяем кэш в localStorage
      const cached = localStorage.getItem('filterOptions');
      if (cached) {
        try {
          setFilterOptions(JSON.parse(cached));
          console.log('✅ Filter options loaded from cache');

          return;
        } catch (e) {
          console.warn('⚠️ Failed to parse cached filter options');
          localStorage.removeItem('filterOptions');
        }
      }

      try {
        const allCharacters = [];

        // 🔹 Загружаем 3 страницы ПОСЛЕДОВАТЕЛЬНО (чтобы не словить rate limit)
        for (let page = 1; page <= 3; page++) {
          try {
            const { data } = await axios.get(`${API_URL}?page=${page}`, {
              timeout: 5000 // 5 секунд таймаут
            });
            allCharacters.push(...data.results);

            // 🔹 Пауза 5000ms между запросами
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } catch (e) {
            console.warn(`⚠️ Page ${page} failed:`, e.message);
            // Продолжаем, даже если одна страница не загрузилась
          }
        }

        if (allCharacters.length > 0) {
          const options = {
            status: [...new Set(allCharacters.map((c) => c.status))].sort(),
            gender: [...new Set(allCharacters.map((c) => c.gender))].sort(),
            species: [...new Set(allCharacters.map((c) => c.species))].sort()
          };

          setFilterOptions(options);
          // 🔹 Сохраняем в кэш
          localStorage.setItem('filterOptions', JSON.stringify(options));
          console.log(
            '✅ Filter options loaded:',
            allCharacters.length,
            'characters'
          );
        }
      } catch (e) {
        console.error('❌ Failed to fetch filter options:', e);
      }
    };

    fetchFilterOptions();
  }, []);

  // ✅ 2. Синхронизация с URL при старте (только один раз)
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
      setApiURL(url.toString());
    }
  }, []);

  // ✅ 3. Загрузка данных персонажей
  const fetchData = useCallback(async (url) => {
    console.log('🔄 Fetching data:', url);
    setIsFetching(true);
    setIsError(false);

    try {
      const { data } = await axios.get(url, {
        timeout: 10000 // 10 секунд таймаут
      });

      console.log('✅ Data loaded:', data.results.length, 'characters');
      setCharacters(data.results);
      setInfo(data.info);
      setIsFetching(false);
    } catch (e) {
      console.error('❌ Fetch error:', e.message);
      setIsError(true);
      setIsFetching(false);
    }
  }, []); // ✅ Пустой массив: set-функции стабильны

  // ✅ 4. Вызываем загрузку при изменении apiURL
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
      filterOptions
    }),
    [
      activePage,
      apiURL,
      characters,
      isFetching,
      isError,
      info,
      fetchData,
      filterOptions
    ]
  );

  return (
    <DataContext.Provider value={dataValue}>{children}</DataContext.Provider>
  );
}

const DataContext = createContext({});

export const useData = () => useContext(DataContext);
