import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

function SentimentPieChart({ data, onPlotClick }) {
  const { labels, values } = useMemo(() => {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    data.forEach(item => {
      counts[item.sentiment_label]++;
    });
    return {
      labels: ['Positive', 'Negative', 'Neutral'],
      values: [counts.positive, counts.negative, counts.neutral],
    };
  }, [data]);

  return (
    <Plot
      data={[
        {
          values: values,
          labels: labels,
          type: 'pie',
          hole: .4,
          marker: {
            colors: ['#4CAF50', '#F44336', '#FFEB3B'],
          },
        },
      ]}
      layout={{
        title: `Sentiment Distribution (Total: ${data.length})`,
        annotations: [
          {
            font: { size: 20 },
            showarrow: false,
            text: `${data.length}`,
            x: 0.5,
            y: 0.5
          }
        ],
        showlegend: true,
        height: 400,
        margin: { l: 20, r: 20, b: 20, t: 40 }
      }}
      style={{ width: '100%', height: '400px' }}
      // This is the key: pass click events up to the parent
      onClick={onPlotClick}
    />
  );
}

export default SentimentPieChart;