import React from 'react';
import { Instructions } from './styles';
import { useLocalization } from '../../context/LocalizationContext';

const TimelineInstructions = () => {
    const { t } = useLocalization();

    return (
        <Instructions>
            <p><strong>{t('instructions')}</strong></p>
            <ul>
                <li>{t('dragItems')}</li>
                <li>{t('dragTimeline')}</li>
                <li>{t('zoomButtons')}</li>
                <li>{t('doubleClickDate')}</li>
                <li>{t('doubleClickEvent')}</li>
                <li>{t('quickNavPanel')}</li>
                <li>{t('selectEvent')}</li>
            </ul>
        </Instructions>
    );
};

export default TimelineInstructions;