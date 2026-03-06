import { useState, useCallback, useEffect } from 'react';
import { useData } from './providers';
import { Select } from './common/Select';
import styled from 'styled-components';

const BASE_URL = 'https://rickandmortyapi.com/api/character/';

export function Filter() {
  const { apiURL, setApiURL, setActivePage, filterOptions } = useData();

  const [localFilters, setLocalFilters] = useState({
    characterName: '',
    characterType: '',
    status: '',
    gender: '',
    species: ''
  });

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      setLocalFilters({
        characterName: params.get('name') || '',
        characterType: params.get('type') || '',
        status: params.get('status') || '',
        gender: params.get('gender') || '',
        species: params.get('species') || ''
      });
    } catch (e) {
      console.warn('⚠️ Failed to parse URL params:', e);
    }
  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(new URL(apiURL).search);
      setLocalFilters({
        characterName: params.get('name') || '',
        characterType: params.get('type') || '',
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

  const handleApply = useCallback(() => {
    try {
      const url = new URL(BASE_URL);

      if (localFilters.characterName)
        url.searchParams.set('name', localFilters.characterName);
      if (localFilters.characterType)
        url.searchParams.set('type', localFilters.characterType);
      if (localFilters.status)
        url.searchParams.set('status', localFilters.status);
      if (localFilters.gender)
        url.searchParams.set('gender', localFilters.gender);
      if (localFilters.species)
        url.searchParams.set('species', localFilters.species);

      const queryString = url.search;
      const browserURL = `/${queryString}`;

      setApiURL(url.toString());
      setActivePage(0);

      if (window.history?.pushState) {
        window.history.pushState({}, '', browserURL);
      }
    } catch (e) {
      console.error('❌ ERROR in handleApply:', {
        message: e.message,
        name: e.name
      });
      alert(`Filter error: ${e.message}`);
    }
  }, [localFilters, setApiURL, setActivePage]);

  const handleReset = useCallback(() => {
    try {
      const defaultFilters = {
        characterName: '',
        characterType: '',
        status: '',
        gender: '',
        species: ''
      };

      setLocalFilters(defaultFilters);
      setApiURL(BASE_URL);
      setActivePage(0);

      if (window.history?.pushState) {
        window.history.pushState({}, '', '/');
      }
    } catch (e) {
      console.error('❌ ERROR in handleReset:', e.message);
      alert(`Reset error: ${e.message}`);
    }
  }, [setApiURL, setActivePage]);

  const hasActiveFilters = Object.values(localFilters).some((v) => v !== '');

  const statusOptions =
    filterOptions?.status?.map((opt) => ({
      value: opt,
      label: opt
    })) || [];

  const genderOptions =
    filterOptions?.gender?.map((opt) => ({
      value: opt,
      label: opt
    })) || [];

  const speciesOptions =
    filterOptions?.species?.map((opt) => ({
      value: opt,
      label: opt
    })) || [];

  return (
    <FilterContainer>
      <Select
        name="status"
        value={localFilters.status}
        onChange={handleInputChange}
        options={[{ value: '', label: 'All Status' }, ...statusOptions]}
        placeholder="All Status"
      />

      <Select
        name="gender"
        value={localFilters.gender}
        onChange={handleInputChange}
        options={[{ value: '', label: 'All Gender' }, ...genderOptions]}
        placeholder="All Gender"
      />

      <Select
        name="species"
        value={localFilters.species}
        onChange={handleInputChange}
        options={[{ value: '', label: 'All Species' }, ...speciesOptions]}
        placeholder="All Species"
      />

      <TextInput
        name="characterName"
        value={localFilters.characterName}
        onChange={handleInputChange}
        placeholder="Name"
      />

      <TextInput
        name="characterType"
        value={localFilters.characterType}
        onChange={handleInputChange}
        placeholder="Type"
      />

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

  & > * {
    flex: 1;
  }
`;
const FilterContainer = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
  max-width: 561px;

  & > * {
    flex: 1;
    max-width: calc(33.3% - 10px);
    min-width: 180px;
  }

  @media (max-width: 1520px) {
    max-width: 482px;

    & > * {
      max-width: calc(33.3% - 10px);
      min-width: 150px;
    }
  }

  @media (max-width: 950px) {
    flex-wrap: wrap;
  }

  @media (max-width: 530px) {
    flex-direction: column;
    max-width: 240px;

    & > * {
      max-width: 100%;
      min-width: 100%;
      width: 100%;
    }

    ${ButtonGroup} {
      flex-direction: column;
    }
  }
`;
const TextInput = styled.input`
  background: #1a1f3a;
  border-radius: 8px;
  border: 1px solid #83bf46;
  color: #fff;
  display: block;
  font-size: 14px;
  padding: 10px 15px;
  width: 100%;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: #718096;
    opacity: 1;
  }

  &:hover {
    background: #252b4a;
    border-color: #4a5568;
  }

  &:focus {
    background: #252b4a;
    border-color: #83bf46;
    box-shadow: 0 0 0 2px rgba(131, 191, 70, 0.2);
  }

  text-overflow: ellipsis;

  &:-ms-input-placeholder {
    color: #718096;
  }

  &::-ms-input-placeholder {
    color: #718096;
  }
`;

const ApplyButton = styled.button`
  padding: 10px;
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
  padding: 10px;
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

    &:hover {
      background: transparent;
    }
  }
`;
