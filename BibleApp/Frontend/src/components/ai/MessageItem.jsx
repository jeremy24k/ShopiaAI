import { Streamdown } from 'streamdown';
import "streamdown/styles.css";
import { User, BookOpen } from "lucide-react";
import Icon from "../ui/Icon";
import { useTranslation } from "../../hooks/useTranslation";
import { useAuthStore } from "../../store/AuthStore";
import { useAiStore } from "../../store/AiStore";
import { useDemoStore } from "../../store/DemoStore";
import CustomLink from './CustomLink';
import FeedbackButtons from './FeedbackButtons';
import ValueLockCard from './ValueLockCard';
import { getVerseRange } from '../../utils/bible';
import styles from '../../styles/AI.module.css';

export default function MessageItem({ msg, index, isStreaming = false, previousUserMessage = null, onDemoLock }) {
    const { language } = useTranslation();
    const user = useAuthStore(state => state.user);
    const demoQuestionsUsed = useDemoStore(state => state.demoQuestionsUsed);
    
    const modeId = useAiStore(state => state.modeId);
    const doctrineId = useAiStore(state => state.doctrineId);
    const availableModes = useAiStore(state => state.availableModes);
    const availableDoctrines = useAiStore(state => state.availableDoctrines);

    const getModeName = (id) => {
        const mode = availableModes.find(m => m.id === id);
        return mode?.name || id;
    };

    const getDoctrineName = (id) => {
        const doctrine = availableDoctrines.find(p => p.id === id);
        return doctrine?.name || id;
    };

    const shouldShowValueLock = !user && !isStreaming && demoQuestionsUsed === 1 && index === 1;

    return (
        <div className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}>
            {msg.role === 'user' ? (
                <UserMessage 
                    msg={msg} 
                    getVerseRange={getVerseRange}
                    getModeName={getModeName}
                    getDoctrineName={getDoctrineName}
                />
            ) : (
                <AssistantMessage 
                    msg={msg}
                    isStreaming={isStreaming}
                    user={user}
                    onDemoLock={onDemoLock}
                    shouldShowValueLock={shouldShowValueLock}
                    language={language}
                    previousUserMessage={previousUserMessage}
                    modeId={modeId}
                    doctrineId={doctrineId}
                />
            )}
        </div>
    );
}

function UserMessage({ msg, getVerseRange, getModeName, getDoctrineName }) {
    return (
        <div className={styles.userQuestionContainer}>
            <div className={styles.userQuestionHeader}>
                <Icon icon={<User />} size="small" color="white" />
            </div>
            <div className={styles.userQuestionContent}>
                <p>{msg.content}</p>
                <div className={styles.answerMode}>
                    {msg.verseContext && msg.verseContext.length > 0 && (
                        <div className={styles.contextVerse}>
                            {getVerseRange(msg.verseContext)}
                        </div>
                    )}
                    <div className={styles.headerMode}>
                        <div className={styles.modeBadges}>
                            <span className={styles.modeBadge}>
                                <Icon icon={<User />} size="tiny" />
                                {getModeName(msg.modeId)}
                            </span>
                            <span className={styles.modeBadge}>
                                <Icon icon={<BookOpen />} size="tiny" />
                                {getDoctrineName(msg.doctrineId)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function AssistantMessage({ 
    msg, 
    isStreaming, 
    user, 
    onDemoLock, 
    shouldShowValueLock,
    language,
    previousUserMessage,
    modeId,
    doctrineId
}) {
    return (
        <div className={styles.assistantAnswerContainer}>
            <div className={styles.assistantAnswerContent}>
                <div className={`${!user && shouldShowValueLock && !isStreaming ? styles.lockedAssistantAnswerContent : ''}`}>
                    <Streamdown 
                        animated={true}
                        isAnimating={isStreaming}
                        linkSafety={{ 
                            enabled: false,
                            allowRelative: true,
                            allowFragments: true
                        }}
                        urlTransform={(url) => url}
                        components={{ a: (props) => <CustomLink user={user} onDemoLock={onDemoLock} {...props} /> }}
                >
                        {msg.content}
                    </Streamdown>

                    {!user && shouldShowValueLock && !isStreaming && (
                        <>
                            <div className={styles.responseBlurOverlay} aria-hidden="true" />
                            <ValueLockCard language={language} className={styles.valueLockCardFloating} />
                        </>
                    )}
                </div>

                <FeedbackButtons 
                    msg={msg}
                    user={user}
                    previousUserMessage={previousUserMessage}
                    modeId={modeId}
                    doctrineId={doctrineId}
                    isStreaming={isStreaming}
                    hideCopy={!user && shouldShowValueLock}
                />
            </div>
        </div>
    );
}
