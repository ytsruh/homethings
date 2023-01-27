type Props = {
  title: string;
  description: string;
  image: string;
  alt: string;
};

export default function PageTitle(props: Props) {
  return (
    <div className="container mx-auto px-10 py-5 md:py-0">
      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="w-3/4 md:w-1/3">
          <h1 className="mb-3 text-primary text-6xl">{props.title}</h1>
          <p className="text-xl">{props.description}</p>
        </div>
        <div className="hidden md:flex md:w-2/3">
          <img
            src={props.image}
            style={styles}
            className="img-fluid mx-auto d-block rounded-md object-cover w-full h-72 lg:h-96"
            alt={props.alt}
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

const styles = {
  maxHeight: "400px",
};
