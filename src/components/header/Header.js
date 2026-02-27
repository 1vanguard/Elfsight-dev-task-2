import styled from 'styled-components';
import { Logo } from './Logo';

export function Header() {
  return (
    <HeaderContainer>
      <Logo />
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
