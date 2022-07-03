import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import Protected from "@/components/Protected";
import PageTitle from "@/components/PageTitle";
import Icon from "@/components/Icon";
import Button from "@/lib/ui/Button";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const desc = "Your profile & account settings";

  const submitData = async () => {
    const url = `/api/profile`;
    const user = JSON.parse(sessionStorage.getItem("user"));
    try {
      setSubmitting(true);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token: user.token,
        },
        body: JSON.stringify({
          profile,
        }),
      });
      //Check for ok response
      if (!response.ok) {
        //Throw error if not ok
        throw Error(response.statusText);
      }
      // Set to json, put token in storage & redirect
      const localStorage = JSON.parse(await sessionStorage.getItem("user"));
      localStorage.userData.darkMode = profile.darkMode;
      localStorage.userData.icon = profile.icon;
      await sessionStorage.setItem("user", JSON.stringify(localStorage));
      setSubmitting(false);
      setRedirect(true);
    } catch (err) {
      setSubmitting(false);
      console.log(err);
    }
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const user = JSON.parse(sessionStorage.getItem("user"));
        const response = await fetch(`/api/profile`, {
          headers: { token: user.token },
        });
        if (!response.ok) {
          setError(true);
        }
        const data = await response.json();
        setProfile(data);
        setLoading(false);
      } catch (err) {
        setError(true);
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (error) {
    router.push("/500");
  }

  if (loading || submitting) {
    return <Loading />;
  }

  if (redirect) {
    router.push("/");
  }

  return (
    <Protected>
      <div className="py-3">
        <PageTitle title="Profile" description={desc} image="img/settings.jpeg" alt="Settings" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 py-5 px-5 md:px-10 lg:px-16">
          <div>
            <h2 className="text-primary text-2xl pb-3 text-center">Account Settings</h2>
            <div className="px-5">
              <div className="py-3">
                <div className="px-3 py-1 mb-2">Name</div>
                <input
                  className="w-full px-6 py-3 rounded-md focus:outline-none bg-transparent border-coal dark:border-salt border"
                  type="text"
                  value={profile.name}
                  placeholder="Name"
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div className="py-3">
                <div className="px-3 py-1 mb-2">Dark Mode</div>
                <div className="flex justify-around px-5 py-2">
                  {["light", "dark", "system"].map((type, i) => (
                    <div key={i}>
                      <input
                        value={type}
                        label={type}
                        name="darkMode"
                        type="radio"
                        defaultChecked={profile.darkMode === type}
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
                      value={type}
                      name="icon"
                      type="radio"
                      defaultChecked={profile.icon === type}
                      id={i}
                      onChange={(e) => setProfile({ ...profile, icon: e.target.value })}
                    />
                    <label>
                      <Icon icon={type} styles={iconStyles} color="text-coal dark:text-salt" />
                    </label>
                  </div>
                )
              )}
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
