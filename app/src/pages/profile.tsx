import { useAuth } from "components/AuthProvider";
import ProfileImageEdit from "components/ProfileImageEdit";
import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState({} as any);
  const auth = useAuth();

  useEffect(() => {
    auth.axiosClient.get("/user/me").then((response: any) => {
      setUser(response.data);
    });
    // eslint-disable-next-line
  }, []);

  const handleUpdateProfile = (event: any) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const language = formData.get("language")?.toString();
    const name = formData.get("name")?.toString();
    const password = formData.get("password")?.toString();
    const confirmPassword = formData.get("confirm-password")?.toString();

    const data = {
      _id: user._id,
      lang: language,
      name: name,
    } as any;

    if (password && password === confirmPassword) {
      data["password"] = password;
    }

    auth.axiosClient.put("/user/me", data)
      .then((response: any) => {
        setUser(response.data);
        alert("Profile updated successfully");
      })
      .catch((error: any) => {
        console.error("Error updating profile:", error);
        alert("Error updating profile. Please try again.");
      });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 px-4 pt-6 xl:grid-cols-3 xl:gap-4 dark:bg-gray-900">
            <div className="mb-4 col-span-full xl:mb-2">
              <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-white">Profile</h1>
            </div>
            <div className="col-span-full xl:col-auto">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <ProfileImageEdit />
              </div>
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white">Language</h3>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Select language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={user?.lang ?? ""}
                    onChange={(event) => setUser({ ...user, lang: event.target.value })}
                    className="bg-gray-50 border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (España)</option>
                  </select>
                </div>
                <div>
                  <button className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                    Save all
                  </button>
                </div>
              </div>
            </div>
            <div className="col-span-2">
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white">General information</h3>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={user?.name ?? ""}
                      onChange={(event) => setUser({ ...user, name: event.target.value })}
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Bonnie Lee"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <input
                      type="text"
                      name="email"
                      value={user?.email ?? ""}
                      disabled
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-400 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-400 dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="email@email.com"
                    />
                  </div>
                  <div className="col-span-6 sm:col-full">
                    <button
                      className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      type="submit"
                    >
                      Save all
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white">Password information</h3>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">New password</label>
                    <input
                      data-popover-target="popover-password"
                      data-popover-placement="bottom"
                      type="password"
                      id="password"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      name="confirm-password"
                      id="confirm-password"
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="col-span-6 sm:col-full">
                    <button
                      className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      type="submit"
                    >
                      Save all
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Logout Section */}
              <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-semibold dark:text-white">Session</h3>
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-full">
                    <button
                      type="button"
                      onClick={() => auth.logout()}
                      className="text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
