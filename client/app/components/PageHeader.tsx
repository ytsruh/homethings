export default function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="py-4 hidden md:block">
      <h1 className="text-2xl">{title}</h1>
      {subtitle && <h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">{subtitle}</h2>}
    </div>
  );
}
