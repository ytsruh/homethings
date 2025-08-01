interface PageTitleProps {
  title: string;
  description: string;
}

export default function PageTitle({ title, description }: PageTitleProps) {
  return (
    <>
      <div className="mb-1 block h-2 w-12 bg-theme rounded-xl"></div>
      <h2 className="text-3xl font-bold">{title}</h2>
      <p className="my-6 w-full max-w-3xl text-lg">{description}</p>
    </>
  );
}
