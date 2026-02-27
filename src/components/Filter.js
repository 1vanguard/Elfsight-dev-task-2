import { useMemo, useCallback } from 'react';
import { useData } from './providers';
import styled from 'styled-components';

export function Filter() {
  const { apiURL, setApiURL, setActivePage, characters } = useData();

  const filterOptions = useMemo(() => {
    const status = [...new Set(characters.map((char) => char.status))].sort();
    const gender = [...new Set(characters.map((char) => char.gender))].sort();
    const species = [...new Set(characters.map((char) => char.species))].sort();

    return { status, gender, species };
  }, [characters]);

  const getFilterValue = useCallback(
    (param) => {
      const url = new URL(apiURL);

      return url.searchParams.get(param) || '';
    },
    [apiURL]
  );

  const handleFilterChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const url = new URL(apiURL);

      if (value) {
        url.searchParams.set(name, value);
      } else {
        url.searchParams.delete(name);
      }

      setApiURL(url.toString());
      setActivePage(0);
    },
    [apiURL, setApiURL, setActivePage]
  );

  const clearAllFilters = useCallback(() => {
    const url = new URL(apiURL);
    ['status', 'gender', 'species'].forEach((param) =>
      url.searchParams.delete(param)
    );
    setApiURL(url.toString());
    setActivePage(0);
  }, [apiURL, setApiURL, setActivePage]);

  const hasActiveFilters = ['status', 'gender', 'species'].some(
    (param) => getFilterValue(param) !== ''
  );

  return (
    <FilterContainer>
      {Object.entries(filterOptions).map(([name, options]) => (
        <FilterSelect
          key={name}
          name={name}
          value={getFilterValue(name)}
          onChange={handleFilterChange}
        >
          <option value="">All {name}</option>{' '}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </FilterSelect>
      ))}

      {hasActiveFilters && (
        <ClearButton onClick={clearAllFilters}>✕ Clear All Filters</ClearButton>
      )}
    </FilterContainer>
  );
}

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 10px 15px;
  border-radius: 5px;
  border: 2px solid #83bf46;
  background: #263750;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  min-width: 150px;
  outline: none;

  &:hover {
    border-color: #fff;
  }

  option {
    background: #263750;
    color: #fff;
  }
`;

const ClearButton = styled.button`
  padding: 10px 20px;
  border-radius: 5px;
  border: none;
  background: #ff5152;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: #ff7677;
    transform: scale(1.05);
  }
`;
