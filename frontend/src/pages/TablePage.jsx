import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import PostTable from '../components/PostTable';

import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';


function TablePage() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    apiClient.getData()
      .then(response => {
        setRowData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorState message={error} />;

  if (rowData.length === 0) {
    return (
      <div>
        <h1>{t('fullDataTable')}</h1>
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <h1>{t('fullDataTable')}</h1>
      <p>{t('showingAllItems')} {rowData.length} {t('fromLast7Days')}</p>
      <div className="card">
        <PostTable rowData={rowData} />
      </div>
    </div>
  );
}

export default TablePage;