import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';
import './LoadingSpinner.css';

function LoadingSpinner() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <div className="spinner-container">
      <div className="loading-spinner"></div>
      <p>{t('loading')}</p>
    </div>
  );
}

export default LoadingSpinner;