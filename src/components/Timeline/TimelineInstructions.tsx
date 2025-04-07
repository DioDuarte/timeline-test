import React from 'react';
import { Instructions } from './styles';
import { useLocalization } from '../../context/LocalizationContext';
import { FaArrowsAlt, FaMousePointer, FaSearchPlus, FaBullseye, FaEdit, FaList, FaCheckSquare, FaInfoCircle } from 'react-icons/fa';
import styled from 'styled-components';
import { theme } from '../../theme/theme';

const InstructionsTitle = styled.div`
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${theme.colors.neutral[700]};
`;

const InstructionsList = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
`;

const Column = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
    flex: 1;
    min-width: 200px;
`;

const InstructionItem = styled.li`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;
    font-size: 13px;
    color: ${theme.colors.neutral[600]};
`;

const IconWrapper = styled.span`
    color: ${theme.colors.primary.main};
    display: flex;
    align-items: center;
`;

const TimelineInstructions = () => {
    const { t } = useLocalization();

    const instructions = [
        { key: 'dragItems', icon: FaArrowsAlt },
        { key: 'dragTimeline', icon: FaMousePointer },
        { key: 'zoomButtons', icon: FaSearchPlus },
        { key: 'doubleClickDate', icon: FaBullseye },
        { key: 'doubleClickEvent', icon: FaEdit },
        { key: 'quickNavPanel', icon: FaList },
        { key: 'selectEvent', icon: FaCheckSquare }
    ];

    const half = Math.ceil(instructions.length / 2);
    const firstColumn = instructions.slice(0, half);
    const secondColumn = instructions.slice(half);

    return (
        <Instructions>
            <InstructionsTitle>
                <IconWrapper>
                    {FaInfoCircle({ size: 16 })}
                </IconWrapper>
                {t('instructions')}
            </InstructionsTitle>

            <InstructionsList>
                <Column>
                    {firstColumn.map((instruction) => (
                        <InstructionItem key={instruction.key}>
                            <IconWrapper>
                                {instruction.icon({ size: 16 })}
                            </IconWrapper>
                            {t(instruction.key)}
                        </InstructionItem>
                    ))}
                </Column>
                <Column>
                    {secondColumn.map((instruction) => (
                        <InstructionItem key={instruction.key}>
                            <IconWrapper>
                                {instruction.icon({ size: 16 })}
                            </IconWrapper>
                            {t(instruction.key)}
                        </InstructionItem>
                    ))}
                </Column>
            </InstructionsList>
        </Instructions>
    );
};

export default TimelineInstructions;