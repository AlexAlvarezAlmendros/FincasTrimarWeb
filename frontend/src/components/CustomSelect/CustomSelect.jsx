import { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "Seleccionar...",
  className = "",
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const selectRef = useRef(null);
  const listRef = useRef(null);

  // Encontrar la opción seleccionada
  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        // Limpiar la clase de apertura hacia arriba
        if (selectRef.current) {
          selectRef.current.classList.remove('open-upward');
        }
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSelectedIndex(-1);
        // Limpiar la clase de apertura hacia arriba
        if (selectRef.current) {
          selectRef.current.classList.remove('open-upward');
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSelectedIndex(-1);
      
      // En móviles, verificar si debe abrirse hacia arriba para evitar que se corte
      if (selectRef.current && window.innerWidth <= 480) {
        const rect = selectRef.current.getBoundingClientRect();
        const remainingSpace = window.innerHeight - rect.bottom;
        const estimatedDropdownHeight = Math.min(options.length * 48 + 16, window.innerHeight * 0.6);
        
        if (remainingSpace < estimatedDropdownHeight && rect.top > estimatedDropdownHeight) {
          selectRef.current.classList.add('open-upward');
        } else {
          selectRef.current.classList.remove('open-upward');
        }
      }
    }
  };

  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSelectedIndex(-1);
    // Limpiar la clase de apertura hacia arriba
    if (selectRef.current) {
      selectRef.current.classList.remove('open-upward');
    }
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (selectedIndex >= 0) {
          handleOptionClick(options[selectedIndex]);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setSelectedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : prev
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll automático a la opción seleccionada
  useEffect(() => {
    if (isOpen && selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex];
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [selectedIndex, isOpen]);

  return (
    <div 
      ref={selectRef}
      className={`custom-select ${className} ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
    >
      <div
        className="custom-select-trigger"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        <span className="custom-select-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className={`custom-select-arrow ${isOpen ? 'rotated' : ''}`}>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          <ul 
            ref={listRef}
            className="custom-select-options"
            role="listbox"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                className={`custom-select-option ${
                  option.value === value ? 'selected' : ''
                } ${index === selectedIndex ? 'highlighted' : ''}`}
                onClick={() => handleOptionClick(option)}
                role="option"
                aria-selected={option.value === value}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;