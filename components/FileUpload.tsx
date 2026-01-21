import React, { useRef, useState } from 'react';
import { Upload, AlertCircle, X } from 'lucide-react';
import Papa from 'papaparse';
import { normalizeDate, parseNumber } from '../services/financeService';

interface FileUploadProps {
  onDataLoaded: (name: string, data: Map<string, number>) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setError(null);
      processFile(e.target.files[0]);
      e.target.value = '';
    }
  };

  const processFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, any>[];
        const dataMap = new Map<string, number>();

        if (rows.length > 0) {
          const keys = Object.keys(rows[0]);
          const dateKeyOrig = keys.find(k => k.trim().toLowerCase().includes('date'));
          const equityKeyOrig = keys.find(k => {
            const l = k.trim().toLowerCase();
            return l.includes('equity') || l.includes('nav') || l.includes('close') || l.includes('balance');
          });

          if (dateKeyOrig && equityKeyOrig) {
            let validRows = 0;
            rows.forEach(row => {
              const d = normalizeDate(row[dateKeyOrig]);
              const val = parseNumber(row[equityKeyOrig]);
              if (d && !isNaN(val)) {
                dataMap.set(d, val);
                validRows++;
              }
            });

            if (validRows > 0) {
              const name = file.name.replace(/\.[^/.]+$/, "");
              onDataLoaded(name, dataMap);
            } else {
              setError(`Check date format (YYYY-MM-DD) and equity values in ${file.name}.`);
            }
          } else {
            setError(`Missing 'Date' or 'Equity' columns in ${file.name}. Detected: ${keys.slice(0, 3).join(', ')}...`);
          }
        } else {
          setError(`The file ${file.name} is empty.`);
        }
      },
      error: (err) => {
        console.error("CSV Error", err);
        setError("Error parsing CSV file.");
      }
    });
  };

  return (
    <div className="mb-4 space-y-3">
      {error && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-medium text-red-800">Invalid Strategy File</p>
            <p className="text-[11px] text-red-600 mt-0.5 leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className="border border-dashed border-neutral-200 rounded-lg p-5 text-center hover:bg-neutral-50 hover:border-neutral-400 transition-all cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />
        <div className="flex flex-col items-center gap-2 text-neutral-500">
          <div className="bg-neutral-100 p-2.5 rounded-lg group-hover:bg-neutral-200 transition-colors">
            <Upload size={20} className="text-neutral-600" />
          </div>
          <span className="font-medium text-sm text-neutral-900">Upload CSV Strategy</span>
          <span className="text-xs text-neutral-400">Format: Date column, Equity column</span>
        </div>
      </div>
    </div>
  );
};