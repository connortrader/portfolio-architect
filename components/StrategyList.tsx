import React from 'react';
import { Strategy } from '../types';
import { Trash2, ExternalLink } from 'lucide-react';

interface StrategyListProps {
  strategies: Strategy[];
  allocations: Record<string, number>;
  onAllocationChange: (id: string, val: number) => void;
  onRemoveStrategy: (id: string) => void;
  totalAllocation: number;
  onReset: () => void;
  onEqualWeight: () => void;
}

export const StrategyList: React.FC<StrategyListProps> = ({
  strategies,
  allocations,
  onAllocationChange,
  onRemoveStrategy,
  totalAllocation,
  onReset,
  onEqualWeight
}) => {

  const builtInStrategies = strategies.filter(s => s.isBuiltIn);
  const userStrategies = strategies.filter(s => !s.isBuiltIn);

  const renderRow = (s: Strategy) => (
    <div key={s.id} className="flex flex-col gap-1.5 py-3 border-b border-stripe-border last:border-0">
      <div className="flex justify-between items-center mb-0.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }}></div>
          <span className="text-sm font-medium text-stripe-secondary truncate max-w-[140px]" title={s.name}>{s.name}</span>
          {s.infoUrl && (
            <a href={s.infoUrl} target="_blank" rel="noreferrer" className="text-stripe-muted hover:text-accent transition-colors">
              <ExternalLink size={11} />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tabular-nums w-8 text-right text-stripe-primary">
            {allocations[s.id] || 0}%
          </span>
          {!s.isBuiltIn && (
            <button
              onClick={() => onRemoveStrategy(s.id)}
              className="text-stripe-muted hover:text-danger transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={allocations[s.id] || 0}
        onChange={(e) => onAllocationChange(s.id, Number(e.target.value))}
        className="w-full"
      />
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-stripe-primary text-sm">Allocations</h3>
        <div className="text-sm font-semibold text-stripe-primary tabular-nums">
          {totalAllocation}%
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <button
          onClick={onEqualWeight}
          className="flex-1 py-1.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-medium rounded transition-colors"
        >
          Equal Weight
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-1.5 px-3 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600 text-xs font-medium rounded transition-colors"
        >
          Reset
        </button>
      </div>

      {userStrategies.length > 0 && (
        <div className="mb-5">
          <h4 className="text-xs font-medium text-stripe-muted tracking-wider mb-3">Your Strategies</h4>
          <div className="flex flex-col">
            {userStrategies.map(renderRow)}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-xs font-medium text-stripe-muted tracking-wider mb-3">SetupAlpha Strategies</h4>
        <div className="flex flex-col">
          {builtInStrategies.map(renderRow)}
        </div>
      </div>
    </div>
  );
};