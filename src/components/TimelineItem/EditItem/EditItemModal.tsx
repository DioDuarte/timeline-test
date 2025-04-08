import { useLocalization } from '../../../context/LocalizationContext';
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import {
    ModalContainer,
    ModalContent,
    ModalHeader,
    ModalTitle,
    ModalBody,
    ModalFooter,
    InputField,
    DateInput,
    Button,
    CloseButton
} from './styles';
import { FiSave, FiX, FiCalendar, FiEdit2 } from 'react-icons/fi';

interface EditItemModalProps {
    item: {
        id: number;
        name: string;
        start: string;
        end: string;
    };
    onSave: (updatedItem: { name: string; start: string; end: string }) => void;
    onClose: () => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({ item, onSave, onClose }) => {
    const { t, locale } = useLocalization();
    const [name, setName] = useState(item.name);
    const [startDate, setStartDate] = useState(format(parseISO(item.start), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(parseISO(item.end), 'yyyy-MM-dd'));

    const handleSave = () => {
        onSave({
            name,
            start: startDate,
            end: endDate,
        });
    };

    const handleModalClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <ModalContainer onClick={onClose}>
            <ModalContent onClick={handleModalClick} onMouseDown={(e) => e.stopPropagation()}>
                <ModalHeader>
                    <ModalTitle>
                        {FiEdit2({ size: 16, style: { marginRight: '8px' } })}
                        {t('editItem')}
                    </ModalTitle>
                    <CloseButton onClick={onClose}>
                        {FiX({ size: 18 })}
                    </CloseButton>
                </ModalHeader>

                <ModalBody style={{ width: '100%', height: '100%' }}>
                    <InputField>
                        <label htmlFor="item-name">{t('itemName')}</label>
                        <input
                            id="item-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </InputField>

                    <InputField>
                        <label htmlFor="start-date">
                            {FiCalendar({ size: 16, style: { marginRight: '6px' } })}
                            {t('startDate')}
                        </label>
                        <DateInput
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            required
                        />
                    </InputField>

                    <InputField>
                        <label htmlFor="end-date">
                            {FiCalendar({ size: 16, style: { marginRight: '6px' } })}
                            {t('endDate')}
                        </label>
                        <DateInput
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            required
                        />
                    </InputField>
                </ModalBody>

                <ModalFooter>
                    <Button type="button" onClick={onClose}>
                        {FiX({ size: 16 })} {t('cancel')}
                    </Button>
                    <Button type="button" primary onClick={handleSave}>
                        {FiSave({ size: 16 })} {t('saveChanges')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </ModalContainer>
    );
};