import React, { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';

function PostTable({ rowData }) {
  const columnDefs = useMemo(() => [
    { 
      field: 'created_utc', 
      headerName: 'Date', 
      sortable: true, 
      filter: true,
      valueFormatter: params => new Date(params.value).toLocaleString(),
      width: 200,
    },
    { 
      field: 'sentiment_label', 
      headerName: 'Sentiment', 
      sortable: true, 
      filter: true,
      width: 120,
      cellStyle: params => {
        if (params.value === 'positive') return { color: 'green', fontWeight: '500' };
        if (params.value === 'negative') return { color: 'red', fontWeight: '500' };
        return { color: 'gray' };
      }
    },
    { 
      field: 'sentiment_score', 
      headerName: 'Score', 
      sortable: true, 
      filter: true,
      width: 100 
    },
    { field: 'subreddit', headerName: 'Subreddit', sortable: true, filter: true, width: 150 },
    { field: 'content', headerName: 'Content', filter: true, flex: 1, minWidth: 300 },
    { 
      field: 'url', 
      headerName: 'Link', 
      width: 100,
      filter: false,
      cellRenderer: params => (
        <a href={params.value} target="_blank" rel="noopener noreferrer">
          View
        </a>
      )
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
  }), []);

  return (
    <div className="ag-theme-quartz" style={{ width: '100%' }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={true}
        paginationPageSize={100}
      />
    </div>
  );
}

export default PostTable;