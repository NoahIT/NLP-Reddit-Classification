import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';

function SentimentTimeSeries({ data, onPlotClick }) {
  const { xData, yData, counts } = useMemo(() => {
    const grouped = {};
    
    // Group by hour
    data.forEach(item => {
      const hourBucket = new Date(item.created_utc).toISOString().substring(0, 13) + ":00:00";
      if (!grouped[hourBucket]) {
        grouped[hourBucket] = { scores: [], count: 0 };
      }
      grouped[hourBucket].scores.push(item.sentiment_score);
      grouped[hourBucket].count++;
    });

    const sortedHours = Object.keys(grouped).sort();
    
    return {
      xData: sortedHours,
      yData: sortedHours.map(hour => grouped[hour].scores.reduce((a, b) => a + b, 0) / grouped[hour].count),
      counts: sortedHours.map(hour => grouped[hour].count)
    };
  }, [data]);

  return (
    <Plot
      data={[
        {
          x: xData,
          y: yData,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Avg. Sentiment',
          hovertemplate: '<b>%{x}</b><br>Avg. Score: %{y:.2f}<br>Count: %{customdata}<extra></extra>',
          customdata: counts,
          marker: { color: '#0d6efd' },
        },
      ]}
      layout={{
        title: 'Average Sentiment Over Time (Hourly)',
        yaxis: { title: 'Avg. Compound Score', range: [-1, 1] },
        height: 400,
        margin: { l: 50, r: 20, b: 50, t: 40 }
      }}
      style={{ width: '100%', height: '400px' }}
      // Pass click events up
      onClick={onPlotClick}
    />
  );
}

export default SentimentTimeSeries;