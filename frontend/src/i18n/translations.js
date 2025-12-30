export const translations = {
    en: {
        // Navbar
        appTitle: 'NLP Analyzer',
        dashboard: 'Dashboard',
        dataTable: 'Data Table',

        // Dashboard
        filterBySubreddit: 'Filter by Subreddit',
        clearFilter: 'Clear Filter',
        collectData: 'Collect Data',
        collecting: 'Collecting...',
        allSubreddits: 'All Subreddits',
        allGroups: 'All Groups',
        filterByGroup: 'Filter by Group',
        searchKeywords: 'Search Keywords',
        legend: 'Legend',
        totalDataPoints: 'Total Data Points',
        radarChartDesc: 'Comparison of subreddits based on sentiment, engagement, and activity.',
        sentimentOverview: 'Sentiment Overview',
        engagementAndComparison: 'Engagement & Comparison',

        // Stats
        totalPosts: 'Total Posts',
        avgSentiment: 'Avg. Sentiment',
        mostCommon: 'Most Common',

        // Charts
        sentimentDistribution: 'Overall Sentiment Distribution',
        total: 'Total',
        topSubreddits: 'Top 10 Active Subreddits',
        postCount: 'Post Count',
        avgSentimentOverTime: 'Average Sentiment Over Time (Hourly)',
        sentimentOverTime: 'Sentiment Trends Over Time',
        avgCompoundScore: 'Avg. Compound Score',
        activityHeatmap: 'Activity Heatmap (Day vs Hour)',
        sentimentBySubreddit: 'Sentiment Distribution per Subreddit',

        // Chart Descriptions
        activityHeatmapDesc: 'Visualizes the intensity of posting activity across different days and hours. Darker colors indicate higher activity.',
        sentimentStackedDesc: 'Breakdown of sentiment (Positive, Neutral, Negative) for each subreddit.',
        sentimentPieDesc: 'Overall distribution of sentiment across all filtered posts.',
        sentimentTimeDesc: 'Trends in sentiment score over time. Useful for spotting spikes or drops in community mood.',
        subredditBarDesc: 'Top 10 most active subreddits by post count.',

        // Sentiment labels
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',

        // States
        loading: 'Loading...',
        noData: 'No Data Available',
        noDataMessage: 'There are no posts to display yet.',
        errorOccurred: 'An Error Occurred',
        errorMessage: 'We ran into a problem while trying to load your data.',
        error: 'Error',
        unknownError: 'An unknown error occurred.',

        // Table
        subreddit: 'Subreddit',
        title: 'Title',
        author: 'Author',
        score: 'Score',
        sentiment: 'Sentiment',
        createdAt: 'Created At',

        // Data Explorer
        dataExplorer: 'Data Explorer',
        filteredByClick: 'Filtered by click',
        showing: 'Showing',
        items: 'items',
        clickPlotToClear: 'Click the plot again to clear selection.',
        clickPlotToFilter: 'Click a plot segment to filter.',

        // Table Page
        fullDataTable: 'Full Data Table',
        showingAllItems: 'Showing all',
        fromLast7Days: 'items from the last 7 days.',
        search: 'Search',
        of: 'of',
        page: 'Page',
        readMore: 'Read more',
        readLess: 'Read less',

        // Comparison Page
        comparison: 'Comparison',
        compareSubreddits: 'Compare Subreddits',
        selectSubreddit: 'Select Subreddit',
        selectTimeframe: 'Select Timeframe',
        panelA: 'Panel A',
        panelB: 'Panel B',
        hours24: 'Last 24 Hours',
        days7: 'Last 7 Days',
        days30: 'Last 30 Days',

        // Common Chart Labels
        time: 'Time',
        averageSentiment: 'Average Sentiment',
        sentimentVsEngagement: 'Sentiment vs Engagement',
        sentimentScore: 'Sentiment Score',
        upvotes: 'Upvotes',
        subredditComparison: 'Subreddit Comparison',
        engagement: 'Engagement',
        activity: 'Activity',
        noDataAvailable: 'No data available',
    },
    lt: {
        // Navbar
        appTitle: 'NLP Analizatorius',
        dashboard: 'Skydelis',
        dataTable: 'Duomenų Lentelė',

        // Dashboard
        filterBySubreddit: 'Filtruoti pagal Subreddit',
        clearFilter: 'Išvalyti Filtrą',
        collectData: 'Rinkti Duomenis',
        collecting: 'Renkami...',
        allSubreddits: 'Visi Subredditai',
        allGroups: 'Visos Grupės',
        filterByGroup: 'Filtruoti pagal Grupę',
        searchKeywords: 'Ieškoti Raktažodžių',
        legend: 'Legenda',
        totalDataPoints: 'Viso Duomenų Taškų',
        radarChartDesc: 'Subreddit palyginimas pagal nuotaiką, įsitraukimą ir aktyvumą.',
        sentimentOverview: 'Nuotaikos Apžvalga',
        engagementAndComparison: 'Įsitraukimas ir Palyginimas',

        // Stats
        totalPosts: 'Viso Įrašų',
        avgSentiment: 'Vid. Nuotaika',
        mostCommon: 'Dažniausias',

        // Charts
        sentimentDistribution: 'Bendras Nuotaikų Pasiskirstymas',
        total: 'Viso',
        topSubreddits: 'Top 10 Aktyviausių Subreddit',
        postCount: 'Įrašų Skaičius',
        avgSentimentOverTime: 'Vidutinė Nuotaika Laike (Kas Valandą)',
        sentimentOverTime: 'Nuotaikų Tendencijos Laike',
        avgCompoundScore: 'Vid. Sudėtinis Balas',
        activityHeatmap: 'Aktyvumo Žemėlapis (Diena vs Valanda)',
        sentimentBySubreddit: 'Nuotaikų Pasiskirstymas pagal Subreddit',

        // Chart Descriptions
        activityHeatmapDesc: 'Vizualizuoja įrašų aktyvumą skirtingomis dienomis ir valandomis. Tamsesnės spalvos rodo didesnį aktyvumą.',
        sentimentStackedDesc: 'Nuotaikų (Teigiama, Neutrali, Neigiama) pasiskirstymas kiekviename subreddit.',
        sentimentPieDesc: 'Bendras nuotaikų pasiskirstymas visuose filtruotuose įrašuose.',
        sentimentTimeDesc: 'Nuotaikų balų tendencijos laike. Naudinga pastebėti bendruomenės nuotaikos pokyčius.',
        subredditBarDesc: 'Top 10 aktyviausių subreddit pagal įrašų skaičių.',

        // Sentiment labels
        positive: 'Teigiama',
        negative: 'Neigiama',
        neutral: 'Neutrali',

        // States
        loading: 'Kraunama...',
        noData: 'Nėra Duomenų',
        noDataMessage: 'Kol kas nėra įrašų, kuriuos būtų galima parodyti.',
        errorOccurred: 'Įvyko Klaida',
        errorMessage: 'Bandant įkelti duomenis, susidūrėme su problema.',
        error: 'Klaida',
        unknownError: 'Įvyko nežinoma klaida.',

        // Table
        subreddit: 'Subreddit',
        title: 'Pavadinimas',
        author: 'Autorius',
        score: 'Balas',
        sentiment: 'Nuotaika',
        createdAt: 'Sukurta',

        // Data Explorer
        dataExplorer: 'Duomenų Naršyklė',
        filteredByClick: 'Filtruota paspaudus',
        showing: 'Rodoma',
        items: 'elementai',
        clickPlotToClear: 'Spustelėkite diagramą dar kartą, kad išvalytumėte pasirinkimą.',
        clickPlotToFilter: 'Spustelėkite diagramos segmentą, kad filtruotumėte.',

        // Table Page
        fullDataTable: 'Visa Duomenų Lentelė',
        showingAllItems: 'Rodoma visi',
        fromLast7Days: 'elementai iš paskutinių 7 dienų.',
        search: 'Paieška',
        of: 'iš',
        page: 'Puslapis',
        readMore: 'Skaityti daugiau',
        readLess: 'Skaityti mažiau',

        // Comparison Page
        comparison: 'Palyginimas',
        compareSubreddits: 'Palyginti Subreddit',
        selectSubreddit: 'Pasirinkti Subreddit',
        selectTimeframe: 'Pasirinkti Laikotarpį',
        panelA: 'Panelė A',
        panelB: 'Panelė B',
        hours24: 'Paskutinės 24 Valandos',
        days7: 'Paskutinės 7 Dienos',
        days30: 'Paskutinės 30 Dienų',

        // Common Chart Labels
        time: 'Laikas',
        averageSentiment: 'Vidutinė Nuotaika',
        sentimentVsEngagement: 'Nuotaika vs Įsitraukimas',
        sentimentScore: 'Nuotaikos Balas',
        upvotes: 'Balsai (Upvotes)',
        subredditComparison: 'Subreddit Palyginimas',
        engagement: 'Įsitraukimas',
        activity: 'Aktyvumas',
        noDataAvailable: 'Nėra duomenų',
    }
};

export const useTranslation = (language) => {
    return (key) => {
        return translations[language]?.[key] || key;
    };
};
