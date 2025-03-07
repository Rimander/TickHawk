import { useRef, useState } from "react";
import { useAuth } from "./AuthProvider";
import ProfileImage from "./ProfileImage";
import { toast } from "react-toastify";

interface ProfileImageEditProps {
  userId?: string;
  onImageChange?: (file: File | null) => void;
  onDelete?: () => void;
}

function ProfileImageEdit({ userId, onImageChange, onDelete }: ProfileImageEditProps) {
  const inputRef = useRef(null);
  const auth = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const notifyFileSize = () => toast.error("File size should be less than 3mb");

  const handleClick = () => {
    if (inputRef.current) {
      (inputRef.current as any).click();
    }
  };

  const handleChange = async (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (!ev.target.files || ev.target.files.length === 0) return;

    // Size of files < 3mb, then alert
    const file = ev.target.files[0];
    if (file.size > 3 * 1024 * 1024) {
      notifyFileSize();
      return;
    }

    // If onImageChange is provided, use it instead of direct upload
    if (onImageChange) {
      onImageChange(file);
      (ev.target as HTMLInputElement).value = "";
      toast.success("Image selected. Save the form to update the profile picture.");
      return;
    }

    // Otherwise fallback to default behavior - direct upload
    await onChange(ev.target.files);
    (ev.target as HTMLInputElement).value = "";
  };

  // Function to handle file upload - direct upload without onImageChange
  const onChange = async (files: FileList) => {
    setIsLoading(true);
    try {
      const file = files[0]; // Just handle the first file
      const formData = new FormData();

      // Different handling for admin editing another user vs user editing own profile
      if (userId && userId !== auth.user?._id) {
        // Admin editing another user's profile - use the user ID endpoint
        formData.append("image", file);

        // Add required fields with placeholder values - these will be ignored by the backend
        // since we're just updating the image
        formData.append("_id", userId);
        formData.append("name", "placeholder");
        formData.append("email", "placeholder@example.com");
        formData.append("role", "customer");
        formData.append("lang", "en");

        try {
          // Now upload the image
          const response = await auth.axiosClient.put(`/user/${userId}/with-image`, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });

          if (response.status === 200) {
            toast.success("Profile image updated successfully");
            // Reload page to show the new image
            window.location.reload();
          } else {
            toast.error("Failed to upload profile image");
          }
        } catch (err: any) {
          console.error("Error uploading profile image:", err);
          toast.error(`Failed to upload profile image: ${err.response?.data?.message || err.message || "Unknown error"}`);
        }
      } else {
        // User editing their own profile - use the file/profile endpoint
        formData.append("file", file);

        try {
          const response = await auth.axiosClient.post("/file/profile", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          if (response.status === 201) {
            toast.success("Profile image updated successfully");
            // Reload page to show the new image
            window.location.reload();
          } else {
            toast.error("Failed to upload profile image");
          }
        } catch (err: any) {
          console.error("Error uploading profile image:", err);
          toast.error(`Failed to upload profile image: ${err.response?.data?.message || err.message || "Unknown error"}`);
        }
      }
    } catch (error) {
      toast.error("Failed to upload profile image");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete profile image
  const handleDeleteImage = async () => {
    setIsLoading(true);
    try {
      // Use different endpoint based on whether editing own profile or another user's profile
      if (userId && userId !== auth.user?._id) {
        // Admin editing another user's profile
        await auth.axiosClient.post(`/user/${userId}/remove-profile-image`);
      } else {
        // User editing their own profile
        await auth.axiosClient.post("/user/me/remove-profile-image");
      }
      toast.success("Profile image removed successfully");
      // Reload page to show changes
      window.location.reload();
    } catch (error: any) {
      console.error("Error removing profile image:", error);
      toast.error(`Failed to remove profile image: ${error.response?.data?.message || error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="items-center sm:flex xl:block 2xl:flex sm:space-x-4 xl:space-x-0 2xl:space-x-4">
      <ProfileImage userId={userId} className="mb-4 rounded-lg w-28 h-28 sm:mb-0 xl:mb-4 2xl:mb-0" />
      <div>
        <h3 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Profile picture</h3>
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">JPG, GIF or PNG. Max size of 3MB</div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleClick}
            type="button"
            disabled={isLoading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 disabled:opacity-50"
          >
            <svg className="w-4 h-4 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z"></path>
              <path d="M9 13h2v5a1 1 0 11-2 0v-5z"></path>
            </svg>
            Upload picture
          </button>
          <input
            type="file"
            aria-label="add files"
            className="sr-only"
            ref={inputRef}
            multiple={false}
            onChange={handleChange}
            accept="image/jpeg,image/png,image/gif"
          />
          <button
            type="button"
            onClick={() => {
              if (onImageChange) {
                onImageChange(null);
                if (onDelete) onDelete();
              } else {
                handleDeleteImage();
              }
            }}
            disabled={isLoading}
            className="py-2 px-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-red-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileImageEdit;
