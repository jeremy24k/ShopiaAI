import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook para manejar el auto-scroll en el chat de IA
 * @param {boolean} shouldAutoScroll - Estado que indica si el auto-scroll está activo
 * @param {Function} setShouldAutoScroll - Función para actualizar el estado de auto-scroll
 * @param {Array} messages - Array de mensajes del chat
 * @param {string} currentResponse - Respuesta actual siendo transmitida (streaming)
 * @param {string} urlConversationId - ID de la conversación desde la URL
 * @param {boolean} isChangingConversation - Bandera que indica si se está cambiando de conversación
 */
export function useAutoScroll(
    shouldAutoScroll,
    setShouldAutoScroll,
    messages,
    currentResponse,
    urlConversationId,
    isChangingConversation
) {
    // Refs
    const lastScrollTop = useRef(0);
    const isUserScrolling = useRef(false);
    const scrollTimeout = useRef(null);
    const streamingScrollInterval = useRef(null);
    const shouldAutoScrollRef = useRef(shouldAutoScroll);
    const streamingStartTime = useRef(null);

    // Keep ref in sync with shouldAutoScroll state
    shouldAutoScrollRef.current = shouldAutoScroll;

    // Handle scroll events
    const handleScroll = useCallback(() => {
        const mainElement = document.querySelector('main.ai');
        if (!mainElement || isChangingConversation) return;

        const currentScrollTop = mainElement.scrollTop;
        const scrollHeight = mainElement.scrollHeight;
        const clientHeight = mainElement.clientHeight;
        const isAtBottom = scrollHeight - currentScrollTop - clientHeight <= 10;

        // Detect user scrolling up (ignore tiny dips from reflow/smooth scroll glitches)
        const scrollUpDelta = lastScrollTop.current - currentScrollTop;
        const minScrollUpToDisable = 15;
        if (scrollUpDelta > minScrollUpToDisable) {
            const isEarlyStreaming = streamingStartTime.current &&
                                     (Date.now() - streamingStartTime.current) < 500;

            if (!isEarlyStreaming) {
                isUserScrolling.current = true;
                setShouldAutoScroll(false);

                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }

                scrollTimeout.current = setTimeout(() => {
                    isUserScrolling.current = false;
                }, 1000);
            }
        }

        // Re-enable auto-scroll if at bottom and not manually scrolling
        if (isAtBottom && !isUserScrolling.current && !shouldAutoScroll) {
            setShouldAutoScroll(true);
        }

        lastScrollTop.current = currentScrollTop;
    }, [shouldAutoScroll, setShouldAutoScroll, isChangingConversation]);

    // Auto-scroll when new messages are added
    useEffect(() => {
        if (shouldAutoScroll) {
            const mainElement = document.querySelector('main.ai');
            if (mainElement) {
                mainElement.scrollTo({
                    top: mainElement.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [messages.length, shouldAutoScroll]);

    // Auto-scroll during streaming using interval
    const isStreaming = !!currentResponse;
    useEffect(() => {
        if (isStreaming && shouldAutoScroll) {
            streamingStartTime.current = Date.now();

            streamingScrollInterval.current = setInterval(() => {
                const mainElement = document.querySelector('main.ai');
                if (mainElement) {
                    const scrollHeight = mainElement.scrollHeight;
                    const currentScrollTop = mainElement.scrollTop;
                    const clientHeight = mainElement.clientHeight;
                    const isAtBottom = scrollHeight - currentScrollTop - clientHeight <= 50;

                    if (isAtBottom) {
                        mainElement.scrollTo({
                            top: scrollHeight,
                            behavior: 'auto'
                        });
                    }
                }
            }, 50);

            return () => {
                clearInterval(streamingScrollInterval.current);
                streamingScrollInterval.current = null;
            };
        } else if (!isStreaming && streamingScrollInterval.current) {
            clearInterval(streamingScrollInterval.current);
            streamingScrollInterval.current = null;
            streamingStartTime.current = null;

            if (shouldAutoScroll) {
                const mainElement = document.querySelector('main.ai');
                if (mainElement) {
                    mainElement.scrollTo({
                        top: mainElement.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [isStreaming, shouldAutoScroll]);

    // Auto-scroll when conversation is loaded
    useEffect(() => {
        if (urlConversationId && messages.length > 0 && shouldAutoScroll) {
            const mainElement = document.querySelector('main.ai');
            if (mainElement) {
                lastScrollTop.current = mainElement.scrollTop;
                mainElement.scrollTo({
                    top: mainElement.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [urlConversationId, messages.length, shouldAutoScroll]);

    // Scroll event listener
    useEffect(() => {
        const mainElement = document.querySelector('main.ai');

        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll);
            return () => {
                mainElement.removeEventListener('scroll', handleScroll);
                if (scrollTimeout.current) {
                    clearTimeout(scrollTimeout.current);
                }
                if (streamingScrollInterval.current) {
                    clearInterval(streamingScrollInterval.current);
                }
            };
        }
    }, [handleScroll]);
}
