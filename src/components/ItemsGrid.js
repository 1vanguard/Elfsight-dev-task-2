import { useState, useCallback } from 'react';
import styled from 'styled-components';
import { Popup } from './popup';
import { useData } from './providers';
import { Card } from './Card';
import { ResetButton } from './common';

const defaultPopupSettings = {
  visible: false,
  content: {}
};

export function ItemsGrid() {
  const { characters } = useData();
  const [popupSettings, setPopupSettings] = useState(defaultPopupSettings);

  const cardOnClickHandler = useCallback(
    (props) => {
      setPopupSettings({
        visible: true,
        content: { ...props }
      });
    },
    [setPopupSettings]
  );

  if (characters.length === 0) {
    return (
      <EmptyState>
        <EmptyStateContent>
          <EmptyIcon>🔍</EmptyIcon>
          <EmptyTitle>No characters found</EmptyTitle>
          <EmptyText>
            Try changing your filters or reset them to see all characters.
          </EmptyText>
          <ResetButton text="Reset Filters" />
        </EmptyStateContent>
      </EmptyState>
    );
  }

  return (
    <Container>
      {characters.map((props) => (
        <Card key={props.id} onClickHandler={cardOnClickHandler} {...props} />
      ))}

      <Popup settings={popupSettings} setSettings={setPopupSettings} />
    </Container>
  );
}

const EmptyState = styled.div`
  width: 100%;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;

const EmptyStateContent = styled.div`
  text-align: center;
  max-width: 400px;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h2`
  color: #fff;
  font-size: 24px;
  margin-bottom: 10px;
`;

const EmptyText = styled.p`
  color: #888;
  font-size: 16px;
  margin-bottom: 25px;
  line-height: 1.5;
`;

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  justify-items: center;
  gap: 30px;
`;
