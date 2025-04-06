import React, { useEffect, useState } from 'react';
import { ScrollArrow } from './styles';

interface ScrollArrowsProps {
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    totalGridWidth: number;
}

const ScrollArrows: React.FC<ScrollArrowsProps> = ({ scrollContainerRef, totalGridWidth }) => {
    const [scrollIndicators, setScrollIndicators] = useState({ left: false, right: false });
    const [containerPosition, setContainerPosition] = useState({ left: 0, top: 0, width: 0, height: 0 });

    // Atualizar a posição do container e verificar se o conteúdo excede o tamanho visível
    useEffect(() => {
        const updatePositionAndIndicators = () => {
            if (!scrollContainerRef.current) return;

            const rect = scrollContainerRef.current.getBoundingClientRect();
            const { clientWidth } = scrollContainerRef.current;
            const contentExceedsWidth = totalGridWidth > clientWidth;

            setContainerPosition({
                left: rect.left + window.scrollX,
                top: rect.top + window.scrollY,
                width: rect.width,
                height: rect.height,
            });

            setScrollIndicators({
                left: contentExceedsWidth,
                right: contentExceedsWidth,
            });
        };

        updatePositionAndIndicators();

        // Atualizar ao redimensionar a janela ou mudar o tamanho do grid
        window.addEventListener('resize', updatePositionAndIndicators);
        return () => window.removeEventListener('resize', updatePositionAndIndicators);
    }, [scrollContainerRef, totalGridWidth]);

    return (
        <>
            {scrollIndicators.left && (
                <ScrollArrow
                    direction="left"
                    style={{
                        position: 'fixed',
                        left: `${containerPosition.left + 10}px`,
                        top: `${containerPosition.top + containerPosition.height / 2}px`,
                        transform: 'translateY(-50%)',
                    }}
                />
            )}
            {scrollIndicators.right && (
                <ScrollArrow
                    direction="right"
                    style={{
                        position: 'fixed',
                        left: `${containerPosition.left + containerPosition.width - 30}px`, // 30px = largura da seta (20px) + margem (10px)
                        top: `${containerPosition.top + containerPosition.height / 2}px`,
                        transform: 'translateY(-50%)',
                    }}
                />
            )}
        </>
    );
};

export default ScrollArrows;