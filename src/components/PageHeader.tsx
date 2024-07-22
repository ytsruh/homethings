type PageHeaderProps = {
  title: string;
  subtitle: string;
};

const PageHeader = (props: PageHeaderProps) => {
  return (
    <div className="py-4">
      <h1 className="text-2xl">{props.title}</h1>
      <h2 className="text-sm text-zinc-500 dark:text-zinc-300 italic">
        {props.subtitle}
      </h2>
    </div>
  );
};

export default PageHeader;
