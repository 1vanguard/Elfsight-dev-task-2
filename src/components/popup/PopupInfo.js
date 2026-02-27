import styled from 'styled-components';
import { Text } from '../common';

export function PopupInfo({ origin, location }) {
  return (
    <StyledPopupInfo>
      {origin?.name !== 'unknown' && (
        <PopupOrigin>
          <Text>First Seen in:</Text>
          <PopupOriginValue>{origin?.name}</PopupOriginValue>
        </PopupOrigin>
      )}

      {location?.name !== 'unknown' && (
        <PopupLastLocation>
          <Text>Last known location:</Text>
          <PopupLastLocationValue>{location?.name}</PopupLastLocationValue>
        </PopupLastLocation>
      )}
    </StyledPopupInfo>
  );
}

const StyledPopupInfo = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;
  margin-bottom: 40px;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const PopupOrigin = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
  max-width: 48%;

  @media (max-width: 600px) {
    max-width: 100%;
  }
`;

const PopupLastLocation = styled(PopupOrigin)``;

const PopupOriginValue = styled.p`
  color: #83bf46;
`;

const PopupLastLocationValue = styled(PopupOriginValue)``;
