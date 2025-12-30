import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

function SentimentPieChart({ data, onPlotClick }) {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = useTranslation(language);
  const textColor = theme === 'dark' ? '#E0E0E0' : '#121212';

  const { labels, values, colors } = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    data.forEach(item => {
      counts[item.sentiment_label]++;
    });
    return {
      labels: [t('positive'), t('negative'), t('neutral')],
      values: [counts.positive, counts.negative, counts.neutral],
      colors: ['#28a745', '#dc3545', '#ffc107']
    };
  }, [data, t]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>
      <div style={{ flex: 1, height: '100%', position: 'relative' }}>
        <Plot
          data={[
            {
              values: values,
              labels: labels,
              type: 'pie',
              hole: .4,
              marker: {
                colors: colors,
              },
              textinfo: 'label+percent',
              textposition: 'inside',
            },
          ]}
          layout={{
            title: `${t('sentimentDistribution')} (${t('total')}: ${data.length})`,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: {
              color: textColor
            },
            annotations: [
              {
                font: { size: 20, color: textColor },
                showarrow: false,
                text: `${data.length}`,
                x: 0.5,
                y: 0.5
              }
            ],
            showlegend: false, // Hide default legend
            margin: { l: 20, r: 20, b: 20, t: 40 },
            autosize: true
          }}
          style={{ width: '100%', height: '100%' }}
          onClick={onPlotClick}
          useResizeHandler={true}
        />
      </div>

      {/* Divider */}
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 1rem' }}></div>

      {/* Custom Legend */}
      <div style={{ width: '250px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem' }}>
        <h4 style={{ marginBottom: '1rem', color: textColor }}>{t('legend')}</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {labels.map((label, index) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: textColor }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: colors[index] }}></div>
              <span>{label}: {values[index]}</span>
            </div>
          ))}
        </div>
        <p className="chart-description" style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
          {t('sentimentPieDesc') || "Overall distribution of sentiment across all filtered posts."}
        </p>
      </div>
    </div>
  );
}

export default SentimentPieChart;