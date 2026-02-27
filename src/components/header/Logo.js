import styled from 'styled-components';
import widgetLogo from '../../assets/widget-logo.png';

export function Logo() {
  return <StyledLogo src={widgetLogo} alt="logo" />;
}

const StyledLogo = styled.img`
  max-width: 300px;
  user-select: none;

  @media (max-width: 930px) {
    margin-bottom: 20px;
  }
`;
