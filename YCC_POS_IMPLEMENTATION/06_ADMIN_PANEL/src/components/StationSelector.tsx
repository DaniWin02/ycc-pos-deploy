import React, { useEffect, useState } from 'react';

interface Station {
  id: string;
  name: string;
  displayName: string;
  color?: string;
  isActive: boolean;
}

interface StationSelectorProps {
  value: string;
  onChange: (stationId: string) => void;
  required?: boolean;
  className?: string;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  value,
  onChange,
  required = true,
  className = ''
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStations();
  }, []);

  const loadStations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('http://localhost:3004/api/stations');
      
      if (!response.ok) {
        throw new Error('Error cargando estaciones');
      }
      
      const data = await response.json();
      setStations(data.filter((s: Station) => s.isActive));
    } catch (err: any) {
      console.error('Error cargando estaciones:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          Estación {required && <span className="text-red-500">*</span>}
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Cargando estaciones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-sm font-medium text-gray-700">
          Estación {required && <span className="text-red-500">*</span>}
        </label>
        <div className="w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 text-red-600 text-sm">
          Error: {error}
        </div>
        <button
          type="button"
          onClick={loadStations}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Estación de Cocina {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <option value="">Seleccionar estación...</option>
        {stations.map(station => (
          <option key={station.id} value={station.id}>
            {station.displayName}
          </option>
        ))}
      </select>
      
      {/* Vista previa del color de la estación seleccionada */}
      {value && stations.find(s => s.id === value)?.color && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div
            className="w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: stations.find(s => s.id === value)?.color }}
          />
          <span>Color asignado en KDS</span>
        </div>
      )}
      
      {required && !value && (
        <p className="text-xs text-gray-500">
          Todos los productos deben tener una estación asignada para el sistema KDS
        </p>
      )}
    </div>
  );
};

export default StationSelector;
