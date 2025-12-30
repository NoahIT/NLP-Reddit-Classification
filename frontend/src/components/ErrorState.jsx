import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';
import './EmptyState.css';

function ErrorState({ message }) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <div className="empty-state-container card" style={{ borderColor: 'var(--danger-color)' }}>
      <h2 style={{ color: 'var(--danger-color)' }}>{t('errorOccurred')}</h2>
      <p>{t('errorMessage')}</p>
      <p>
        <strong>{t('error')}:</strong> {message || t('unknownError')}
      </p>
    </div>
  );
}

export default ErrorState;