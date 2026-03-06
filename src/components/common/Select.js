import { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select',
  name
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);

      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleSelect = useCallback(
    (optionValue) => {
      onChange({
        target: {
          name,
          value: optionValue
        }
      });
      setIsOpen(false);
    },
    [onChange, name]
  );

  const handleOptionClick = useCallback(
    (e) => {
      const value = e.currentTarget.dataset.value;
      handleSelect(value);
    },
    [handleSelect]
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onChange({
        target: {
          name,
          value: ''
        }
      });
      setIsOpen(false);
    },
    [onChange, name]
  );

  const selectedOption = options?.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || value || placeholder;
  const hasValue = !!value;

  return (
    <SelectContainer ref={containerRef}>
      <SelectTrigger onClick={handleToggle} isOpen={isOpen} hasValue={hasValue}>
        <SelectValue hasValue={hasValue}>{displayValue}</SelectValue>

        {hasValue && !isOpen ? (
          <ClearButton onClick={handleClear}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </ClearButton>
        ) : (
          <SelectArrow isOpen={isOpen}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline
                points={isOpen ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}
              />
            </svg>
          </SelectArrow>
        )}
      </SelectTrigger>

      {isOpen && (
        <SelectDropdown>
          {options?.map((option) => (
            <SelectOption
              key={option.value}
              data-value={option.value}
              onClick={handleOptionClick}
              isActive={value === option.value}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectDropdown>
      )}
    </SelectContainer>
  );
}

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectTrigger = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  background: #1a1f3a;
  border: 1px solid #83bf46;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;

  &:hover {
    border-color: #4a5568;
    background: #252b4a;
  }

  ${({ isOpen }) =>
    isOpen &&
    `
    border-color: #83bf46;
    background: #252b4a;
  `}
`;

const SelectValue = styled.span`
  color: #fff;
  font-size: 14px;

  ${({ hasValue }) => !hasValue && 'color: #718096;'}
`;

const SelectArrow = styled.div`
  color: #83bf46;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  margin-left: 8px;

  ${({ isOpen }) => isOpen && 'transform: rotate(180deg);'}
`;

const ClearButton = styled.div`
  color: #718096;
  display: flex;
  align-items: center;
  margin-left: 8px;
  transition: color 0.2s;
  padding: 2px;

  &:hover {
    color: #83bf46;
  }
`;

const SelectDropdown = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;

  max-height: 190px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;

    &:hover {
      background: #555;
    }
  }

  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
`;

const SelectOption = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #1a202c;
  transition: all 0.15s;
  user-select: none;

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
  }

  &:hover {
    background: #e2f5d8;
  }

  ${({ isActive }) =>
    isActive &&
    `
    background: #e2f5d8;
    font-weight: 600;
  `}
`;
