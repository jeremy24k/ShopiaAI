import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Send } from 'lucide-react';
import styles from '../../styles/ContactForm.module.css';

function ContactForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [status, setStatus] = useState(''); // 'success' | 'error' | ''

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    
    try {
      const response = await fetch('https://formspree.io/f/mqeygoeb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });
      
      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '' });
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          setStatus('');
        }, 5000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={styles.contact}>
      <div className={styles.contact_container}>
        <div className={styles.contact_header}>
          <h2 className={styles.contact_title}>
            {t('landing_contact_title')}
          </h2>
          <p className={styles.contact_subtitle}>
            {t('landing_contact_subtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.contact_form}>
          <div className={styles.form_row}>
            <div className={styles.form_group}>
              <label htmlFor="name" className={styles.form_label}>
                {t('landing_contact_name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('landing_contact_name_placeholder')}
                className={styles.form_input}
                required
              />
            </div>

            <div className={styles.form_group}>
              <label htmlFor="email" className={styles.form_label}>
                {t('landing_contact_email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('landing_contact_email_placeholder')}
                className={styles.form_input}
                required
              />
            </div>
          </div>

          <div className={styles.form_group}>
            <label htmlFor="message" className={styles.form_label}>
              {t('landing_contact_message')}
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t('landing_contact_message_placeholder')}
              className={styles.form_textarea}
              rows="6"
              required
            />
          </div>

          {status === 'success' && (
            <div className={styles.message_success}>
              {t('landing_contact_success')}
            </div>
          )}

          {status === 'error' && (
            <div className={styles.message_error}>
              {t('landing_contact_error')}
            </div>
          )}

          <button type="submit" className={styles.submit_button}>
            <Send size={20} />
            {t('landing_contact_submit')}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ContactForm;
