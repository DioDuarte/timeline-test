import React from 'react';
import { ZoomLevel } from '../../types/types';
import { TimelineControls, ZoomButton } from './styles';
import { useLocalization } from '../../context/LocalizationContext';

interface TimelineControlsProps {
    zoomLevel: ZoomLevel;
    setZoomLevel: (zoom: ZoomLevel) => void;
    focusIndicatorVisible: boolean;
    onRemoveFocus: () => void;
}

const TimelineControlsComponent: React.FC<TimelineControlsProps> = ({
                                                                        zoomLevel,
                                                                        setZoomLevel,
                                                                        focusIndicatorVisible,
                                                                        onRemoveFocus,
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
            <button
                onClick={onRemoveFocus}
                disabled={!focusIndicatorVisible}
                style={{
                    marginLeft: 'auto',
                    opacity: focusIndicatorVisible ? 1 : 0.5,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    cursor: focusIndicatorVisible ? 'pointer' : 'default',
                }}
            >
                {t('removeReferencePoint')}
            </button>
        </TimelineControls>
    );
};

export default TimelineControlsComponent;