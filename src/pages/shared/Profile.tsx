import  { useState } from "react";
import { LogOut, Save } from "lucide-react";

const ProfileComponent = () => {
  // Mock data for demonstration purposes
  const [profile, setProfile] = useState({
    username: "johndoe",
    email: "john.doe@example.com",
    phone_number: "+1234567890",
  });

  const [formData, setFormData] = useState({
    email: profile.email,
    phone_number: profile.phone_number,
  });

  const [formErrors, setFormErrors] = useState({ email: "", phone_number: "" });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [updateError, setUpdateError] = useState(null);

  const validateForm = () => {
    let valid = true;
    const errors = { email: "", phone_number: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = "Email is required";
      valid = false;
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format";
      valid = false;
    }

    if (formData.phone_number && !/^\+?\d{10,15}$/.test(formData.phone_number)) {
      errors.phone_number = "Invalid phone number (10-15 digits)";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsUpdating(true);

      // Simulate API call
      setTimeout(() => {
        setProfile({
          ...profile,
          email: formData.email,
          phone_number: formData.phone_number,
        });
        setIsUpdating(false);
        setIsSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => setIsSuccess(false), 3000);
      }, 1000);
    }
  };

  const handleLogout = () => {
    alert("Logout clicked");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 transform hover:shadow-xl transition-all duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-secondary via-accent to-secondary text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/30 animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white/20"></div>
            <div className="absolute top-20 right-20 w-16 h-16 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: "0.5s" }}></div>
          </div>
          <div className="flex flex-col items-center space-y-4 relative z-10">
            <div className="w-24 h-24 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg border-2 border-white/50 transform hover:scale-105 transition-transform duration-300">
              <svg className="h-10 w-10 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-wide">{profile.username || "User Profile"}</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative">
          {/* Decorative elements */}
          <div className="absolute -right-12 -bottom-12 w-40 h-40 rounded-full bg-accent/5"></div>
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-secondary/5"></div>

          {isSuccess && (
            <div className="mb-6 bg-accent/10 border-l-4 border-accent p-4 rounded-md animate-slideUp">
              <div className="flex">
                <div className="flex-shrink-0 text-accent">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-accent font-medium">Profile updated successfully!</p>
                </div>
              </div>
            </div>
          )}

          {updateError && (
            <div className="mb-6 bg-error/10 border-l-4 border-error p-4 rounded-md animate-slideUp">
              <div className="flex">
                <div className="flex-shrink-0 text-error">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-error font-medium">
                    Update failed: {updateError || "Unknown error"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6 relative z-10">
            {/* Username field */}
            <div className="relative transform hover:-translate-y-1 transition-transform duration-300">
              <input
                type="text"
                value={profile.username || ""}
                disabled
                className="bg-gray-50 border border-gray-300 text-primary text-sm rounded-lg block w-full p-3 shadow-sm"
              />
              <div className="text-xs text-gray-500 mt-1 ml-2">Username cannot be changed</div>
            </div>

            {/* Email field */}
            <div className="relative transform hover:-translate-y-1 transition-transform duration-300">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email address"
                className={`bg-white border text-sm rounded-lg block w-full p-3 shadow-sm ${
                  formErrors.email ? "border-error" : "border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary"
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-sm text-error">{formErrors.email}</p>
              )}
            </div>

            {/* Phone field */}
            <div className="relative transform hover:-translate-y-1 transition-transform duration-300">
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Phone number (optional)"
                className={`bg-white border text-sm rounded-lg block w-full p-3 shadow-sm ${
                  formErrors.phone_number ? "border-error" : "border-gray-300 focus:ring-2 focus:ring-secondary focus:border-secondary"
                }`}
              />
              {formErrors.phone_number ? (
                <p className="mt-1 text-sm text-error">{formErrors.phone_number}</p>
              ) : (
                <p className="mt-1 text-xs text-gray-500 ml-2">Optional</p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleSubmit}
                disabled={isUpdating}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-secondary to-accent text-white font-medium rounded-lg text-sm px-6 py-3 w-full sm:w-auto transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1 hover:scale-105"
              >
                {isUpdating ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save size={18} />
                )}
                Save Changes
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 border-2 border-error text-error hover:bg-error hover:text-white font-medium rounded-lg text-sm px-6 py-3 w-full sm:w-auto transition-all duration-300 hover:shadow-md transform hover:-translate-y-1"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;