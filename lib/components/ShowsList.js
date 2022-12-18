import React from "react";

export default function ShowsList(props) {
  const rows = props.data.map((x, i) => {
    return <Show key={i} data={x} />;
  });
  return (
    <div className="container mx-auto px-5 md:px-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-5">{rows}</div>
    </div>
  );
}

const Show = (props) => {
  const imageUrl = `${process.env.NEXT_PUBLIC_CDN_BASEURL}/images/shows/${props.data.imageName}`;
  return (
    <div className="my-3">
      <a href={"/shows/" + props.data.id}>
        <img src={imageUrl} alt={props.data.title} className="w-full h-60 sm:h-52" />
      </a>
    </div>
  );
};
