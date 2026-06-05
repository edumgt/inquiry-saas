import { useEffect, useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';

export default function TariffsPage() {
  const { token } = useAuth();
  const [tariffs, setTariffs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [tariffData, vehicleData] = await Promise.all([
          apiRequest('/reference/tariffs', {}, token),
          apiRequest('/reference/vehicles', {}, token),
        ]);
        setTariffs(tariffData);
        setVehicles(vehicleData);
      } catch (err) {
        setError(err.message || 'Failed to load tariffs');
      }
    };
    load();
  }, [token]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => map.set(v.id, v.vehicle_name));
    return map;
  }, [vehicles]);

  const rowData = useMemo(
    () => tariffs.map((row) => ({ ...row, vehicle_name: vehicleMap.get(row.vehicle_spec_id) || `#${row.vehicle_spec_id}` })),
    [tariffs, vehicleMap]
  );

  const columnDefs = useMemo(() => [
    { headerName: 'Origin', field: 'origin', minWidth: 160, pinned: 'left' },
    { headerName: 'Destination Region', field: 'destination_region', minWidth: 180 },
    { headerName: 'Vehicle', field: 'vehicle_name', minWidth: 160 },
    { headerName: 'Base USD', field: 'base_price_usd', valueFormatter: (p) => `$${Number(p.value || 0).toLocaleString('en-US')}` },
    { headerName: 'LCL USD/CBM', field: 'lcl_price_usd_per_cbm', valueFormatter: (p) => `$${Number(p.value || 0).toLocaleString('en-US')}` },
    { headerName: 'Overweight USD/Ton', field: 'overweight_surcharge_usd_per_ton', valueFormatter: (p) => `$${Number(p.value || 0).toLocaleString('en-US')}` },
    { headerName: 'Size Surcharge %', field: 'size_surcharge_pct', valueFormatter: (p) => `${p.value}%` },
  ], []);

  return (
    <section className="g-card p-0 overflow-hidden">
      <div className="px-5 py-4 border-b border-g-outline">
        <h2 className="text-xl font-medium text-g-on-surface">Tariff Matrix</h2>
        <p className="mt-0.5 text-sm text-g-secondary">관리자 업로드 대상 요율 구조를 AG Grid에서 조회합니다.</p>
      </div>

      <div className="p-5">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
        )}

        <div className="ag-theme-quartz h-[620px] w-full overflow-hidden rounded-xl border border-g-outline">
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={{ sortable: true, filter: true, resizable: true, floatingFilter: true }}
            pagination
            paginationPageSize={20}
            animateRows
          />
        </div>
      </div>
    </section>
  );
}
