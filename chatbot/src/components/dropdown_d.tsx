import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
    options: string[];
    value?: string;
    onChange: (value: string, index: number) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select option",
    className = "",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(value || "");
    const [openUpwards, setOpenUpwards] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (options.length > 0 && !selectedValue) {
            const firstOption = options[0];
            setSelectedValue(firstOption);
            onChange(firstOption, 0);
        }
    }, [options, selectedValue, onChange]);

    useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);

    useEffect(() => {
        if (isOpen && dropdownRef.current && listRef.current) {
            const dropdown = dropdownRef.current;
            const list = listRef.current;
            const rect = dropdown.getBoundingClientRect();
            const listHeight = list.scrollHeight;
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            if (spaceBelow < listHeight && spaceAbove > spaceBelow) {
                setOpenUpwards(true);
            } else {
                setOpenUpwards(false);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleOptionClick = (option: string, index: number) => {
        setSelectedValue(option);
        setIsOpen(false);
        onChange(option, index);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (disabled) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                setIsOpen(!isOpen);
                break;
            case 'Escape':
                setIsOpen(false);
                break;
            case 'ArrowDown':
                event.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    // Navigate options logic pending
                }
                break;
            case 'ArrowUp':
                event.preventDefault();
                if (isOpen) {
                    // Navigate options logic pending
                }
                break;
        }
    };

    return (
        <div 
            className={`custom-dropdown ${className} ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''} quicksand-light`}
            ref={dropdownRef}
        >
            <div
                className="dropdown-trigger"
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                tabIndex={disabled ? -1 : 0}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-disabled={disabled}
            >
                <span className="dropdown-value">
                    {selectedValue || placeholder}
                </span>
                <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>
                    <i className="fa-solid fa-chevron-down"></i>
                </span>
            </div>
            
            {isOpen && (
                <ul 
                    className={`dropdown-list ${openUpwards ? 'opens-up' : 'opens-down'}`}
                    ref={listRef}
                    role="listbox"
                >
                    {options.map((option, index) => (
                        <li
                            key={index}
                            className={`dropdown-option ${selectedValue === option ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option, index)}
                            role="option"
                            aria-selected={selectedValue === option}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;