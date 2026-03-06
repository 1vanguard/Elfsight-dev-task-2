import styled from 'styled-components';
import { Logo } from './Logo';
import { Filter } from '../Filter';
import { useData } from '../providers';

export function Header() {
  const { isFetching, isFilterOptionsLoading, isError } = useData();

  return (
    <HeaderContainer>
      <Logo />

      {!isFilterOptionsLoading && !isFetching && !isError && <Filter />}
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;

  @media (min-width: 1520px) {
    flex-direction: row;
    justify-content: space-evenly;
  }
`;
