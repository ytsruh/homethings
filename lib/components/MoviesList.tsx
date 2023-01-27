import React, { useState } from "react";
import { useRouter } from "next/router";
import Button from "@/lib/ui/Button";
import { BsX } from "react-icons/bs";

type Props = {
  data: Movie[];
};

type Movie = {
  close: any;
  text: string;
};

export default function MoviesList(props: Props) {
  const rows = props.data.map((x: Movie, i: number) => {
    return <Movie key={i} data={x} />;
  });
  return (
    <div className="container mx-auto px-5 md:px-0">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <>{rows}</>
      </div>
    </div>
  );
}

const Movie = (props: any) => {
  const [show, setShow] = useState(false);
  const imageUrl = `${process.env.NEXT_PUBLIC_IMAGES_ENDPOINT}/images/movies/${props.data.imageName}`;
  return (
    <div className="my-3">
      <div onClick={() => setShow(!show)} className="cursor-pointer">
        <img className="h-120 w-full" src={imageUrl} alt={props.data.title} />
        {show ? (
          <div className="overflow-auto w-full h-full fixed inset-0 z-10 flex items-center justify-center cursor-auto bg-coal/90 bg-scroll">
            <div
              className="fixed flex flex-col w-11/12 md:w-8/12 lg:w-6/12 h-120 bg-salt dark:bg-coal justify-between rounded-lg p-5
            border border-salt"
            >
              <div className="flex justify-between">
                <p className="text-primary text-2xl">{props.data.title}</p>
                <BsX className="cursor-pointer text-3xl" onClick={() => setShow(!show)} />
              </div>
              <div className="flex items-center">
                <div className="w-0 sm:w-1/4">
                  <img className="h-48" src={imageUrl} alt={props.data.title} />
                </div>
                <div className="w-100 sm:w-3/4 sm:px-3">
                  <h6 className="my-2">Duration: {props.data.duration}</h6>
                  <h6 className="my-2">Genre: Comedy</h6>
                  <h6 className="my-2">Year: {props.data.releaseYear}</h6>
                  <p className="my-5">{props.data.description}</p>
                </div>
              </div>
              <div className="flex justify-between">
                <a href={`/movies/${props.data.id}`}>
                  <Button>Play</Button>
                </a>
                <Button
                  color="bg-coal dark:bg-salt"
                  text="text-salt dark:text-coal"
                  onClick={() => setShow(!show)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};
