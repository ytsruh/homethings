import { useState } from "react";
import { useRouter } from "next/router";
import Icon from "@/lib/ui/Icon";
import useFavourite from "../hooks/useFavourite";
import PropTypes from "prop-types";

type Props = {
  id: string;
  type: string;
  favourite: boolean;
};

export default function FavouriteButton(props: Props) {
  const router = useRouter();
  const [favourite, setFavourite] = useState(props.favourite);
  const [update, setUpdate] = useState(false);
  const { success, error } = useFavourite({ favourite, update, props });

  function toggle() {
    setFavourite(!favourite);
    setUpdate(true);
  }

  if (error) {
    router.push("/500");
  }

  if (success) {
    router.push("/");
  }

  return (
    <button onClick={() => toggle()} className={`bg-salt text-coal border border-coal px-6 py-3 rounded-md`}>
      <div className="flex content-center">
        <p className="px-1">Favourite</p>
        <Icon
          icon={favourite ? "BsHeartFill" : "BsHeart"}
          color="bg-salt"
          styles={{
            fontSize: "22px",
          }}
        />
      </div>
    </button>
  );
}

FavouriteButton.propTypes = {
  id: PropTypes.string,
  type: PropTypes.string,
  favourite: PropTypes.object,
};
