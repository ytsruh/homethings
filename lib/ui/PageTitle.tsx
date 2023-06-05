import PropTypes from "prop-types";

type Props = {
  title: string;
  description?: string;
  image: string;
  alt: string;
};

export default function PageTitle(props: Props) {
  return (
    <div className="container mx-auto px-10 py-5 md:py-0">
      <div className="flex flex-col md:flex-row items-center justify-center">
        <div className="w-full lg:w-1/2 xl:w-1/3 text-center lg:text-left px-5">
          <h1 className="mb-3 text-primary text-6xl">{props.title}</h1>
          {props.description ? <p className="text-xl">{props.description}</p> : null}
        </div>
        <div className="hidden lg:flex lg:w-1/2 xl:w-2/3">
          <img
            src={props.image}
            style={styles}
            className="img-fluid mx-auto d-block rounded-md object-cover w-full h-48 my-2"
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

PageTitle.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  alt: PropTypes.string,
};
