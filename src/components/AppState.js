import { useCallback } from 'react';
import styled from 'styled-components';
import { Loader, Text, ResetButton } from './common';
import { useData } from './providers';

export function AppState() {
  const {
    isFetching,
    isFilterOptionsLoading,
    isError,
    isRateLimited
  } = useData();

  const handleReloadPage = useCallback(() => {
    window.location.reload();
  }, []);

  if (isRateLimited) {
    return (
      <AppStateContainer>
        <Text>Too many requests. Please wait a moment.</Text>
        <ResetButton text="Reload Page" onClick={handleReloadPage} />
      </AppStateContainer>
    );
  }

  if (isError) {
    return (
      <AppStateContainer>
        <Text>An error has occurred. Try other search parameters.</Text>
        <div>
          <ResetButton text="Back to Home" />
        </div>
      </AppStateContainer>
    );
  }

  if (isFilterOptionsLoading) {
    return (
      <AppStateContainer>
        <Loader />
      </AppStateContainer>
    );
  }

  if (isFetching) {
    return (
      <AppStateContainer>
        <Loader />
      </AppStateContainer>
    );
  }

  return null;
}

const AppStateContainer = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;
