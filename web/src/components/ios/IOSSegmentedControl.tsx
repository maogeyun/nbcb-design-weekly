'use client';

interface IOSSegmentedControlProps<T extends string> {
  items: { key: T; label: string }[];
  activeKey: T;
  onChange: (key: T) => void;
}

export function IOSSegmentedControl<T extends string>({
  items,
  activeKey,
  onChange,
}: IOSSegmentedControlProps<T>) {
  return (
    <div className="ios-segmented" role="tablist">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={activeKey === item.key}
          className={`ios-segment${activeKey === item.key ? ' ios-segment--active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
