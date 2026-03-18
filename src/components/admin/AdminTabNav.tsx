type TabItem = {
  key: string;
  label: string;
};

export function AdminTabNav({
  items,
  activeTab,
  onSelect,
}: {
  items: TabItem[];
  activeTab: string;
  onSelect: (tab: string) => void;
}) {
  return (
    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {items.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onSelect(tab.key)}
          className={`rounded-full px-4 py-2 text-xs whitespace-nowrap ${activeTab === tab.key ? "bg-[var(--foreground)] text-white" : "border border-[var(--line)] bg-white/70"}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
