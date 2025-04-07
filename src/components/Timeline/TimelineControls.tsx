import React from 'react';
import { ZoomLevel } from '../../types/types';
import { TimelineControls, ZoomButton } from './styles';
import { useLocalization } from '../../context/LocalizationContext';

interface TimelineControlsProps {
    zoomLevel: ZoomLevel;
    setZoomLevel: (zoom: ZoomLevel) => void;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLocalization();
    return (
        <>
            <select style={{height: '34px', width: '100px', textAlign: 'center', paddingRight: '3px'}} value={language} onChange={(e) => setLanguage(e.target.value as 'en' | 'pt')}>
                <option value="en">English</option>
                <option value="pt">Português</option>
            </select>
        </>

    );
};

const TimelineControlsComponent: React.FC<TimelineControlsProps> = ({
                                                                        zoomLevel,
                                                                        setZoomLevel,

                                                                    }) => {
    const { t } = useLocalization();

    return (
        <TimelineControls>
            <ZoomButton active={zoomLevel === 'day'} onClick={() => setZoomLevel('day')}>
                {t('day')}
            </ZoomButton>
            <ZoomButton active={zoomLevel === 'week'} onClick={() => setZoomLevel('week')}>
                {t('week')}
            </ZoomButton>
            <ZoomButton active={zoomLevel === 'month'} onClick={() => setZoomLevel('month')}>
                {t('month')}
            </ZoomButton>

            <LanguageSwitcher/>
        </TimelineControls>
    );
};

export default TimelineControlsComponent;