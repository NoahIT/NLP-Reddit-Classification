import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';
import './PostTable.css';

function PostTable({ rowData }) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('created_utc');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const itemsPerPage = 20;

  const filteredData = useMemo(() => {
    if (!searchTerm) return rowData;
    const term = searchTerm.toLowerCase();
    return rowData.filter(item =>
      item.content?.toLowerCase().includes(term) ||
      item.subreddit?.toLowerCase().includes(term) ||
      item.sentiment_label?.toLowerCase().includes(term)
    );
  }, [rowData, searchTerm]);

  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'created_utc') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSentimentColor = (label) => {
    if (label === 'positive') return '#40c060';
    if (label === 'negative') return '#f86c6c';
    return '#90A4AE';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString(language === 'lt' ? 'lt-LT' : 'en-US');
  };

  const toggleExpand = (rowKey) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowKey)) {
      newExpanded.delete(rowKey);
    } else {
      newExpanded.add(rowKey);
    }
    setExpandedRows(newExpanded);
  };

  const isContentLong = (content) => {
    return content && content.length > 100;
  };

  return (
    <div className="custom-table-container">
      {/* Search Bar */}
      <div className="table-controls">
        <input
          type="text"
          className="table-search"
          placeholder={`${t('search')}...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <div className="table-info">
          {t('showing')} {paginatedData.length} {t('of')} {sortedData.length} {t('items')}
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('created_utc')} className="sortable">
                {t('createdAt')} {sortField === 'created_utc' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('subreddit')} className="sortable">
                {t('subreddit')} {sortField === 'subreddit' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('sentiment_label')} className="sortable">
                {t('sentiment')} {sortField === 'sentiment_label' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('sentiment_score')} className="sortable">
                {t('score')} {sortField === 'sentiment_score' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>{t('title')}</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => {
              const rowKey = `${currentPage}-${index}`;
              const isExpanded = expandedRows.has(rowKey);
              const contentIsLong = isContentLong(row.content);

              return (
                <tr key={rowKey}>
                  <td className="date-cell">{formatDate(row.created_utc)}</td>
                  <td className="subreddit-cell">r/{row.subreddit}</td>
                  <td className="sentiment-cell">
                    <span
                      className="sentiment-badge"
                      style={{ backgroundColor: getSentimentColor(row.sentiment_label) }}
                    >
                      {row.sentiment_label}
                    </span>
                  </td>
                  <td className="score-cell">{row.sentiment_score?.toFixed(3)}</td>
                  <td className="content-cell">
                    <div className={`content-text ${isExpanded ? 'expanded' : ''}`}>
                      {isExpanded || !contentIsLong
                        ? row.content
                        : `${row.content.substring(0, 100)}...`}
                    </div>
                    {contentIsLong && (
                      <button
                        className="read-more-btn"
                        onClick={() => toggleExpand(rowKey)}
                      >
                        {isExpanded ? t('readLess') : t('readMore')}
                      </button>
                    )}
                  </td>
                  <td className="link-cell">
                    <a href={row.url} target="_blank" rel="noopener noreferrer" className="view-link">
                      View →
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="table-pagination">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ««
        </button>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn"
        >
          ‹
        </button>
        <span className="pagination-info">
          {t('page')} {currentPage} {t('of')} {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          ›
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="pagination-btn"
        >
          »»
        </button>
      </div>
    </div>
  );
}

export default PostTable;