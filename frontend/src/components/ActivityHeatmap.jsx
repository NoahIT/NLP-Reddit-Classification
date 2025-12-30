
import React, { useMemo } from 'react';
import Plot from 'react-plotly.js';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../i18n/translations';

function ActivityHeatmap({ data }) {
    const { theme } = useTheme();
    const { language } = useLanguage();
    const t = useTranslation(language);
    const textColor = theme === 'dark' ? '#E0E0E0' : '#121212';

    const { z, x, y } = useMemo(() => {
        const grid = Array(7).fill(0).map(() => Array(24).fill(0));

        data.forEach(item => {
            const date = new Date(item.created_utc);
            const day = date.getDay();
            const hour = date.getHours();
            grid[day][hour]++;
        });

        const reorderedGrid = [
            grid[1], grid[2], grid[3], grid[4], grid[5], grid[6], grid[0]
        ];

        const days = [
            t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')
        ];

        const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

        return {
            z: reorderedGrid,
            x: hours,
            y: days
        };
    }, [data, t]);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Plot
                data={[{
                    z: z,
                    x: x,
                    y: y,
                    type: 'heatmap',
                    colorscale: theme === 'dark' ? 'Viridis' : 'Blues',
                    showscale: true
                }]}
                layout={{
                    title: t('activityHeatmap'),
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    font: { color: textColor },
                    margin: { l: 60, r: 20, b: 50, t: 50 },
                    xaxis: { title: t('hourOfDay') },
                    yaxis: { title: t('dayOfWeek') },
                    autosize: true
                }}
                style={{ width: '100%', flex: 1 }}
                useResizeHandler={true}
            />
            <p className="chart-description">
                {t('activityHeatmapDesc') || "Visualizes the intensity of posting activity across different days and hours. Darker colors indicate higher activity."}
            </p>
        </div>
    );
}

export default ActivityHeatmap;
