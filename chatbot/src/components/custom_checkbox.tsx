import React, { useState, useEffect } from 'react';

interface CustomCheckboxProps {
    id?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    onLabel?: string;
    offLabel?: string;
    disabled?: boolean;
    className?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
    id = 'custom-checkbox',
    checked = false,
    onChange,
    onLabel = 'ON',
    offLabel = 'OFF',
    disabled = false,
    className = ''
}) => {
    const [isChecked, setIsChecked] = useState(checked);

    useEffect(() => {
        setIsChecked(checked);
    }, [checked]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = event.target.checked;
        setIsChecked(newChecked);
        if (onChange) {
            onChange(newChecked);
        }
        // alert(newChecked); => true/false
    };



    return (
        <div className={`checkbox-wrapper-8 ${className}`}>
            <input
                className="tgl tgl-skewed"
                id={id}
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
                disabled={disabled}
            />
            <label
                className="tgl-btn"
                data-tg-off={offLabel}
                data-tg-on={onLabel}
                htmlFor={id}
            />
        </div>
    );
};

export default CustomCheckbox;
