import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState from './ui/EmptyState';
import Spinner from './ui/Spinner';
import './DataTable.css';

export default function DataTable({ columns, data, loading, page = 1, totalPages = 1, onPageChange, emptyTitle = 'No data', onRowClick }) {
  if (loading) {
    return <div className="dt-loading"><Spinner size={28} /></div>;
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} />;
  }

  return (
    <div className="dt-wrap">
      <div className="dt-scroll">
        <table className="dt">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row._id || i} onClick={() => onRowClick?.(row)} className={onRowClick ? 'dt-row--clickable' : ''}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="dt-pagination">
          <button
            className="dt-page-btn"
            disabled={page <= 1}
            onClick={() => onPageChange?.(page - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="dt-page-info">Page {page} of {totalPages}</span>
          <button
            className="dt-page-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange?.(page + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
