const API_URL = 'https://rickandmortyapi.com/api/character/';
const CACHE_KEY = 'filterOptions';
const CACHE_TTL = 24 * 60 * 60 * 1000;
const BASE_DELAY = 800;

function isCacheValid(cached) {
  if (!cached?.timestamp || !cached?.options) return false;

  return Date.now() - cached.timestamp < CACHE_TTL;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;
  let retryDelay = BASE_DELAY;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(15000)
      });

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

async function fetchFilterOptionsFromAPI(onProgress) {
  const allStatus = new Set();
  const allGender = new Set();
  const allSpecies = new Set();

  let page = 1;
  let totalPages = 42;

  while (page <= totalPages) {
    try {
      const data = await fetchWithRetry(`${API_URL}?page=${page}`);

      data.results?.forEach((char) => {
        if (char?.status) allStatus.add(char.status);
        if (char?.gender) allGender.add(char.gender);
        if (char?.species) allSpecies.add(char.species);
      });

      if (data.info?.pages) {
        totalPages = data.info.pages;
      }

      if (onProgress) {
        onProgress({ current: page, total: totalPages });
      }

      await delay(BASE_DELAY);

      page++;
    } catch (error) {
      console.warn(`⚠️ Page ${page} failed: ${error.message}`);

      page++;
    }
  }

  return {
    status: [...allStatus].sort(),
    gender: [...allGender].sort(),
    species: [...allSpecies].sort()
  };
}

export async function loadFilterOptions() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (isCacheValid(parsed)) {
        return parsed.options;
      } else {
        localStorage.removeItem(CACHE_KEY);
      }
    }
  } catch (e) {
    console.warn('⚠️ Failed to parse cached filter options:', e);
    localStorage.removeItem(CACHE_KEY);
  }

  try {
    const options = await fetchFilterOptionsFromAPI();

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        timestamp: Date.now(),
        options
      })
    );

    return options;
  } catch (e) {
    console.error('❌ Failed to fetch filter options:', e);

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
