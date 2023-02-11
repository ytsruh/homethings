export default function Custom500() {
  return (
    <div className="flex items-center justify-center h-screen bg-salt dark:bg-coal text-coal dark:text-salt">
      <div className="text-center">
        <h2 className="text-primary text-5xl py-2">
          500 <span className="text-coal dark:text-salt"> : Error</span>
        </h2>
        <h5 className="text-coal dark:text-salt text-xl py-2">Something went wrong. Please try again</h5>
      </div>
    </div>
  );
}
