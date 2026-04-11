import { useEffect, useRef, useCallback } from 'react';

const SCROLL_THRESHOLD = 80;
const SCROLL_TO_BOTTOM_THRESHOLD = 50;

export function useAutoScroll({
    containerRef,
    shouldAutoScroll,
    setShouldAutoScroll,
    dependencies = []
}) {
    const isUserScrollingRef = useRef(false);
    const wasAtBottomRef = useRef(true);

    const getScrollContainer = useCallback(() => {
        if (containerRef?.current) {
            let el = containerRef.current;
            while (el && el.parentElement) {
                const style = window.getComputedStyle(el);
                const overflowY = style.overflowY;
                if (overflowY === 'auto' || overflowY === 'scroll') {
                    return el;
                }
                el = el.parentElement;
            }
            return document.querySelector('main.ai') || document.querySelector('main') || el;
        }
        return document.querySelector('main');
    }, [containerRef]);

    const scrollToBottom = useCallback((smooth = false) => {
        const container = getScrollContainer();
        if (!container) return;

        const maxScroll = container.scrollHeight - container.clientHeight;
        container.scrollTo({
            top: maxScroll,
            behavior: smooth ? 'smooth' : 'instant'
        });
    }, [getScrollContainer]);

    const handleScroll = useCallback(() => {
        const container = getScrollContainer();
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const maxScroll = scrollHeight - clientHeight;
        const isAtBottom = maxScroll - scrollTop <= SCROLL_TO_BOTTOM_THRESHOLD;
        const scrollDelta = maxScroll - scrollTop;

        if (isAtBottom) {
            if (!wasAtBottomRef.current && !shouldAutoScroll) {
                setShouldAutoScroll(true);
            }
            wasAtBottomRef.current = true;
            isUserScrollingRef.current = false;
        } else {
            if (scrollDelta > SCROLL_THRESHOLD && wasAtBottomRef.current) {
                isUserScrollingRef.current = true;
                setShouldAutoScroll(false);
            }
            wasAtBottomRef.current = false;
        }
    }, [getScrollContainer, shouldAutoScroll, setShouldAutoScroll]);

    useEffect(() => {
        const container = getScrollContainer();
        if (!container) return;

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, [getScrollContainer, handleScroll]);

    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom(true);
        }
    }, [shouldAutoScroll, scrollToBottom]);

    const deps = Array.isArray(dependencies) ? dependencies : [];
    useEffect(() => {
        if (shouldAutoScroll) {
            scrollToBottom(false);
        }
    }, [shouldAutoScroll, scrollToBottom, ...deps]);

    return {
        scrollToBottom: () => scrollToBottom(true)
    };
}
