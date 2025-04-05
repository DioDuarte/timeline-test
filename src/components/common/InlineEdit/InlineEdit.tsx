// src/components/common/InlineEdit.tsx
import React, { useState } from 'react';
import { ItemInput } from '../../TimelineItem/styles';

interface InlineEditProps {
    initialValue: string;
    onSave: (value: string) => void;
    onCancel?: () => void;
}

const InlineEdit: React.FC<InlineEditProps> = ({ initialValue, onSave, onCancel = () => {} }) => {
    const [editValue, setEditValue] = useState(initialValue);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditValue(e.target.value);
    };

    const handleInputBlur = () => {
        if (editValue.trim()) {
            onSave(editValue.trim());
        } else {
            onCancel();
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleInputBlur();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <ItemInput
            type="text"
            value={editValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            autoFocus
        />
    );
};

export default InlineEdit;