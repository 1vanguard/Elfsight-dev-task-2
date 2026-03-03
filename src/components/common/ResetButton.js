import { useCallback } from 'react';
import { useData } from '../providers';
import styled from 'styled-components';

const BASE_URL = 'https://rickandmortyapi.com/api/character/';

export function ResetButton({ text = 'Back to Home', onClick }) {
  const { fetchData, setApiURL, setActivePage } = useData();

  const handleDefaultReset = useCallback(() => {
    setApiURL(BASE_URL);
    setActivePage(0);
    window.history.pushState({}, '', '/');
    fetchData(BASE_URL);
  }, [fetchData, setApiURL, setActivePage]);

  const handleClick = onClick || handleDefaultReset;

  return <StyledButton onClick={handleClick}>{text}</StyledButton>;
}

const StyledButton = styled.button`
  padding: 12px 30px;
  border-radius: 8px;
  border: 2px solid #83bf46;
  background: transparent;
  color: #83bf46;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 15px;

  &:hover {
    background: #83bf46;
    color: #0b0d17;
  }
`;
