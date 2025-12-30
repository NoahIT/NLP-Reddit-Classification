import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';
import './EmptyState.css';

function EmptyState() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  return (
    <div className="empty-state-container card">
      <h2>{t('noData')}</h2>
      <p>{t('noDataMessage')}</p>
    </div>
  );
}

export default EmptyState;