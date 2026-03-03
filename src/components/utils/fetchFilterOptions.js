// src/utils/fetchFilterOptions.js

const API_URL = 'https://rickandmortyapi.com/api/character/';
const CACHE_KEY = 'filterOptions';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 часа

// 🔹 Убрали ограничение — загружаем ВСЕ страницы
// const MAX_PAGES_FOR_FILTERS = 10; // ❌ УДАЛИТЬ

// 🔹 Увеличенная задержка для защиты от 429 (было 600ms)
const BASE_DELAY = 800; // ⬆️ 800ms между запросами

/**
 * Проверяет валидность кэша
 */
function isCacheValid(cached) {
  if (!cached?.timestamp || !cached?.options) return false;

  return Date.now() - cached.timestamp < CACHE_TTL;
}

/**
 * Задержка
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Запрос с обработкой 429 и retry
 */
async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;
  let retryDelay = BASE_DELAY;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📡 Request ${attempt}/${maxRetries}: ${url}`);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000)
      });

      // 🔹 Обработка 429 Too Many Requests
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : retryDelay;

        console.warn(`⚠️ 429 Too Many Requests. Waiting ${waitTime}ms...`);
        await delay(waitTime);
        retryDelay *= 2;
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return data;
    } catch (error) {
      lastError = error;

      if (error.name === 'AbortError') {
        console.error(`❌ Request aborted: ${url}`);
        break;
      }

      if (error.message?.includes('429') || error.code === 'ERR_NETWORK') {
        console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);
        await delay(retryDelay);
        retryDelay *= 2;
        continue;
      }

      console.error(`❌ Request failed: ${error.message}`);
      break;
    }
  }

  throw lastError || new Error('Request failed after all retries');
}

/**
 * Собирает ВСЕ уникальные значения фильтров из API (все 42 страницы)
 */
export async function fetchFilterOptionsFromAPI(onProgress) {
  const allStatus = new Set();
  const allGender = new Set();
  const allSpecies = new Set();

  let page = 1;
  let totalPages = 42; // 🔹 Фиксируем 42 страницы

  console.log(`📊 Starting to load ALL ${totalPages} pages...`);

  while (page <= totalPages) {
    try {
      const data = await fetchWithRetry(`${API_URL}?page=${page}`);

      data.results?.forEach((char) => {
        if (char?.status) allStatus.add(char.status);
        if (char?.gender) allGender.add(char.gender);
        if (char?.species) allSpecies.add(char.species);
      });

      // 🔹 Обновляем totalPages из API (на случай изменений)
      if (data.info?.pages) {
        totalPages = data.info.pages;
      }

      // 🔹 Лог каждые 5 страниц, чтобы не спамить
      if (page % 5 === 0 || page === totalPages) {
        console.log(
          `📄 Page ${page}/${totalPages} loaded (${Math.round(
            (page / totalPages) * 100
          )}%)`
        );
      }

      // 🔹 Прогресс для UI
      if (onProgress) {
        onProgress({ current: page, total: totalPages });
      }

      // 🔹 Пауза между запросами (защита от 429)
      await delay(BASE_DELAY);

      page++;
    } catch (error) {
      console.warn(`⚠️ Page ${page} failed: ${error.message}`);

      // 🔹 При ошибке всё равно идём дальше (не прерываем)
      page++;
    }
  }

  console.log(`✅ All ${totalPages} pages loaded!`);
  console.log('📊 Collected:', {
    status: allStatus.size,
    gender: allGender.size,
    species: allSpecies.size
  });

  return {
    status: [...allStatus].sort(),
    gender: [...allGender].sort(),
    species: [...allSpecies].sort()
  };
}

/**
 * Загружает опции: кэш → API
 */
export async function loadFilterOptions() {
  // 🔹 Проверяем кэш
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isCacheValid(parsed)) {
        console.log('✅ Filter options loaded from cache');

        return parsed.options;
      } else {
        console.log('🔄 Cache expired, fetching ALL pages from API...');
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to parse cached filter options:', e);
    localStorage.removeItem(CACHE_KEY);
  }

  // 🔹 Загружаем ВСЕ страницы из API
  console.log('🌐 Fetching filter options from ALL pages...');
  console.log('⏱️ This may take 30-60 seconds...');

  try {
    const options = await fetchFilterOptionsFromAPI();

    // 🔹 Сохраняем в кэш с timestamp
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        options
      })
    );

    console.log('✅ Filter options cached:', {
      status: options.status.length,
      gender: options.gender.length,
      species: options.species.length
    });

    return options;
  } catch (e) {
    console.error('❌ Failed to fetch filter options:', e);

    // 🔹 Фолбэк на расширенный набор (на случай полной неудачи)
    return {
      status: ['Alive', 'Dead', 'unknown'],
      gender: ['Male', 'Female', 'Genderless', 'unknown'],
      species: [
        'Alien',
        'Alien Parasite',
        'Animal',
        'Cronenberg',
        'Disease',
        'Dinosaur',
        'Demon',
        'Human',
        'Humanoid',
        'Mythological',
        'Parasite',
        'Poopybutthole',
        'Robot',
        'Robot Parasite',
        'unknown'
      ]
    };
  }
}
