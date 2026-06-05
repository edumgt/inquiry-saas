import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

export default function AdminUsersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest('/admin/users', {}, token).then(setRows).catch((err) => setError(err.message || 'Failed to load users'));
  }, [token]);

  const columnDefs = useMemo(() => [
    { headerName: 'Name', field: 'full_name', minWidth: 170, pinned: 'left' },
    { headerName: 'Email', field: 'email', minWidth: 260 },
    { headerName: 'Company', field: 'company_name', minWidth: 220 },
    { headerName: 'Role', field: 'role', maxWidth: 130 },
    { headerName: 'Tier', field: 'tier', maxWidth: 130 },
    { headerName: 'Active', field: 'is_active', maxWidth: 120, valueFormatter: (p) => (p.value ? 'Yes' : 'No') },
  ], []);

  return (
    <section className="g-card p-0 overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-g-outline">
        <div>
          <h2 className="text-xl font-medium text-g-on-surface">User Administration</h2>
          <p className="mt-0.5 text-sm text-g-secondary">승인 사용자 계정/등급/권한 조회 (Admin Only)</p>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <div className="ag-theme-quartz h-[620px] w-full overflow-hidden rounded-xl border border-g-outline">
          <AgGridReact
            rowData={rows}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, filter: true, resizable: true, floatingFilter: true }}
            pagination
            paginationPageSize={20}
          />
        </div>
      </div>
    </section>
  );
}
