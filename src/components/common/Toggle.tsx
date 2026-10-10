import React from 'react';
import { sound } from '../../utils/sound';

interface Props {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  id?: string;
  color?: 'green' | 'purple' | 'blue';
}

export const Toggle: React.FC<Props> = ({
  checked,
  onChange,
  label,
  disabled = false,
  id,
  color = 'green',
}) => {
  const handleClick = () => {
    if (disabled) return;
    sound.playClick();
    onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const getActiveTrackColor = () => {
    switch (color) {
      case 'purple':
        return 'bg-lizu-purple border-lizu-purple-dark';
      case 'blue':
        return 'bg-lizu-blue border-lizu-blue-dark';
      case 'green':
      default:
        return 'bg-lizu-green border-lizu-green-dark';
    }
  };

  return (
    <div className="inline-flex items-center min-h-[44px] min-w-[44px]">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex items-center w-12 h-7 rounded-full p-1 cursor-pointer transition-colors duration-200 shrink-0 select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lizu-green dark:focus-visible:ring-offset-gray-900 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          checked
            ? getActiveTrackColor()
            : 'bg-gray-300 dark:bg-gray-700 border-2 border-gray-400/40 dark:border-gray-600'
        }`}
      >
        <span
          className={`pointer-events-none block w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
