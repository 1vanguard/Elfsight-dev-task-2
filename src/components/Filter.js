import { useState, useCallback, useEffect } from 'react';
import { useData } from './providers';
import styled from 'styled-components';

// ✅ ВАЖНО: Константа должна быть в этом файле!
const BASE_URL = 'https://rickandmortyapi.com/api/character/';

export function Filter() {
  const { apiURL, setApiURL, setActivePage, filterOptions } = useData();

  const [localFilters, setLocalFilters] = useState({
    name: '',
    type: '',
    status: '',
    gender: '',
    species: ''
  });

  // Читаем фильтры из URL при старте
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setLocalFilters({
        name: params.get('name') || '',
        type: params.get('type') || '',
        status: params.get('status') || '',
        gender: params.get('gender') || '',
        species: params.get('species') || ''
      });
    } catch (e) {
      console.warn('⚠️ Failed to parse URL params:', e);
    }
  }, []);

  // Синхронизация при изменении apiURL извне
  useEffect(() => {
    try {
      const params = new URLSearchParams(new URL(apiURL).search);
      setLocalFilters({
        name: params.get('name') || '',
        type: params.get('type') || '',
        status: params.get('status') || '',
        gender: params.get('gender') || '',
        species: params.get('species') || ''
      });
    } catch (e) {
      console.warn('⚠️ Failed to sync filters from apiURL:', e);
    }
  }, [apiURL]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // ✅ Кнопка Apply — с try/catch и отладкой
  const handleApply = useCallback(() => {
    try {
      console.log('🎯 Apply clicked, filters:', localFilters);

      // 🔹 Строим объект URL для работы с параметрами
      const url = new URL(BASE_URL);

      if (localFilters.name) url.searchParams.set('name', localFilters.name);
      if (localFilters.type) url.searchParams.set('type', localFilters.type);
      if (localFilters.status)
        url.searchParams.set('status', localFilters.status);
      if (localFilters.gender)
        url.searchParams.set('gender', localFilters.gender);
      if (localFilters.species)
        url.searchParams.set('species', localFilters.species);

      const queryString = url.search; // ✅ Только "?name=Rick&status=Alive"
      const browserURL = `/${queryString}`; // ✅ "/?name=Rick&status=Alive"

      console.log('🔗 Query string:', queryString);
      console.log('🔗 Browser URL:', browserURL);

      // 🔹 Обновляем контекст ПОЛНЫМ URL API
      setApiURL(url.toString()); // ✅ https://rickandmortyapi.com/...
      setActivePage(0);

      // 🔹 Обновляем URL БРАУЗЕРА только query-параметрами
      if (window.history?.pushState) {
        window.history.pushState({}, '', browserURL); // ✅ localhost:3000/?name=Rick
        console.log('✅ Browser URL updated');
      }
    } catch (e) {
      console.error('❌ ERROR in handleApply:', {
        message: e.message,
        name: e.name
      });
      alert(`Filter error: ${e.message}`);
    }
  }, [localFilters, setApiURL, setActivePage]);

  // ✅ Кнопка Reset
  const handleReset = useCallback(() => {
    try {
      const defaultFilters = {
        name: '',
        type: '',
        status: '',
        gender: '',
        species: ''
      };

      setLocalFilters(defaultFilters);
      setApiURL(BASE_URL);
      setActivePage(0);

      // ✅ Сбрасываем URL браузера на корень
      if (window.history?.pushState) {
        window.history.pushState({}, '', '/');
      }
      console.log('✅ Filters reset, URL: /');
    } catch (e) {
      console.error('❌ ERROR in handleReset:', e.message);
      alert(`Reset error: ${e.message}`);
    }
  }, [setApiURL, setActivePage]);

  const hasActiveFilters = Object.values(localFilters).some((v) => v !== '');

  return (
    <FilterContainer>
      <TextInput
        name="name"
        value={localFilters.name}
        onChange={handleInputChange}
        placeholder="Name"
      />
      <TextInput
        name="type"
        value={localFilters.type}
        onChange={handleInputChange}
        placeholder="Type"
      />

      <FilterSelect
        name="status"
        value={localFilters.status}
        onChange={handleInputChange}
      >
        <option value="">All Status</option>
        {filterOptions?.status?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        name="gender"
        value={localFilters.gender}
        onChange={handleInputChange}
      >
        <option value="">All Gender</option>
        {filterOptions?.gender?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        name="species"
        value={localFilters.species}
        onChange={handleInputChange}
      >
        <option value="">All Species</option>
        {filterOptions?.species?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </FilterSelect>

      <ButtonGroup>
        <ApplyButton onClick={handleApply}>Apply</ApplyButton>
        <ResetButton onClick={handleReset} disabled={!hasActiveFilters}>
          Reset
        </ResetButton>
      </ButtonGroup>
    </FilterContainer>
  );
}

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`;
const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  align-items: center;
  padding: 20px;

  @media (max-width: 1520px) {
    flex-wrap: nowrap;
  }

  @media (max-width: 950px) {
    flex-wrap: wrap;
  }

  @media (max-width: 530px) {
    flex-direction: column;
    align-items: stretch;

    ${ButtonGroup} {
      flex-direction: column;
    }
  }
`;
const TextInput = styled.input`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #83bf46;
  background: #1a1f3a;
  color: #fff;
  font-size: 14px;
  min-width: 150px;
  outline: none;
  transition: all 0.2s;

  &::placeholder {
    color: #718096;
  }

  &:hover {
    border-color: #4a5568;
  }

  &:focus {
    border-color: #83bf46;
    box-shadow: 0 0 0 2px rgba(131, 191, 70, 0.2);
  }
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border-radius: 8px;
  border: 1px solid #83bf46;
  background: #1a1f3a;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  min-width: 150px;
  outline: none;
  appearance: none;
  background-image: url('data:image/svg+xml,...');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 12px;

  &:hover {
    border-color: #4a5568;
  }

  &:focus {
    border-color: #83bf46;
  }

  option {
    background: #1a1f3a;
    color: #fff;
  }
`;
const ApplyButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #83bf46;
  background: transparent;
  color: #83bf46;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #83bf46;
    color: #0b0d17;
  }
`;

const ResetButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  border: 1px solid #e53e3e;
  background: transparent;
  color: #e53e3e;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e53e3e;
    color: #fff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: #4a5568;
    color: #4a5568;

    &:hover {
      background: transparent;
    }
  }
`;
