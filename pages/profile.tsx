import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/lib/ui/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/lib/ui/PageTitle";
import Icon from "@/lib/ui/Icon";
import Button from "@/lib/ui/Button";
import { getProfile } from "./api/profile";
import { GetServerSideProps } from "next";

export default function Profile(props: any) {
  const router = useRouter();
  const { profileData } = props;
  const [profile, setProfile] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const desc = "Your profile & account settings";

  useEffect(() => {
    if (router.isReady && !profileData) {
      router.push("/404");
    }
  }, [router, profileData]);

  const submitData = async () => {
    try {
      setSubmitting(true);
      const response = await fetch(`/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      setSubmitting(false);
      setRedirect(true);
    } catch (err) {
      setSubmitting(false);
      console.log(err);
    }
  };

  if (error) {
    router.push("/500");
  }

  if (submitting) {
    return <Loading />;
  }

  if (redirect) {
    router.push("/");
  }

  return (
    <Protected>
      <div className="py-3">
        <PageTitle title="Profile" description={desc} image="img/settings.jpg" alt="Settings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 px-5 md:px-10 lg:px-16">
          <div>
            <h2 className="text-primary text-2xl pb-3 text-center">Account Settings</h2>
            <div className="px-5">
              <div className="py-3">
                <div className="px-3 py-1 mb-2">Name</div>
                <input
                  className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                  type="text"
                  defaultValue={profileData.name}
                  placeholder="Name"
                  onChange={(e) => setProfile({ ...profileData, name: e.target.value })}
                />
              </div>
              <div className="py-3">
                <div className="px-3 py-1 mb-2">Dark Mode</div>
                <div className="flex justify-around px-5 py-2">
                  {["light", "dark", "system"].map((type, i) => (
                    <div key={i}>
                      <input
                        defaultValue={type}
                        name="darkMode"
                        type="radio"
                        defaultChecked={profileData.darkMode === type}
                        key={i}
                        className="text-white text-capitalize"
                      />
                      <label className="capitalize px-3">{type}</label>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-zinc-400 px-3 py-1 mb-2">
                  Please note: This feature does not currently work
                </div>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-primary text-2xl pb-3 text-center">Profile Icon</h2>
            <div className="flex justify-around px-5">
              {["BsFillEmojiSmileUpsideDownFill", "BsTrophyFill", "BsFillCameraReelsFill", "BsHeartFill"].map(
                (type, i) => (
                  <div key={i}>
                    <input
                      defaultValue={type}
                      name="icon"
                      type="radio"
                      defaultChecked={profileData.icon === type}
                      id={i.toString()}
                      onChange={(e) => setProfile({ ...profileData, icon: e.target.value })}
                    />
                    <label>
                      <Icon icon={type} styles={iconStyles} color="text-coal dark:text-salt" />
                    </label>
                  </div>
                )
              )}
            </div>
            <div className="text-sm text-zinc-400 p-3">
              Please note: This will only update the next time you log in.
            </div>
          </div>
        </div>
        <div className="flex justify-center py-5" onClick={() => submitData()}>
          <Button>Submit</Button>
        </div>
      </div>
    </Protected>
  );
}

const iconStyles = {
  fontSize: "50px",
};

export const getServerSideProps: GetServerSideProps = async (context: any) => {
  const profile = await getProfile(context.req);
  // Have to stringify then parse otherwise date objects cannot be passed to page
  const stringify = JSON.stringify(profile);
  const parsed = JSON.parse(stringify);
  return {
    props: { profileData: parsed }, // will be passed to the page component as props
  };
};
