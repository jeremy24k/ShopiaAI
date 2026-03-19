import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ChevronDown } from 'lucide-react';
import styles from '../../styles/LandingFAQ.module.css';

function LandingFAQ() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: t('landing_faq_q1'),
      answer: t('landing_faq_a1'),
    },
    {
      question: t('landing_faq_q2'),
      answer: t('landing_faq_a2'),
    },
    {
      question: t('landing_faq_q3'),
      answer: t('landing_faq_a3'),
    },
    {
      question: t('landing_faq_q4'),
      answer: t('landing_faq_a4'),
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className={styles.faq}>
      <div className={styles.faq_container}>
        <h2 className={styles.faq_title}>
          {t('landing_faq_title')}
        </h2>

        <div className={styles.faq_list}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faq_item} ${openIndex === index ? styles.faq_item_open : ''}`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={styles.faq_question}
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  size={24} 
                  className={`${styles.chevron} ${openIndex === index ? styles.chevron_open : ''}`}
                />
              </button>
              
              <div className={`${styles.faq_answer} ${openIndex === index ? styles.faq_answer_open : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default LandingFAQ;
