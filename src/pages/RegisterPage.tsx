import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { registerTenant } from "../api/auth";

type FormErrors = {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
};

const emptyErrors: FormErrors = {
  companyName: "",
  fullName: "",
  email: "",
  password: "",
};

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<FormErrors | null>(null);
  // Server-side / general errors are kept separate from field-level errors,
  // since they aren't tied to a single input.
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    fullName: "",
    email: "",
    password: "",
  });

  // Server/API-level error shown in a banner; field errors render inline below each input.
  const errorMessages = apiError ? [apiError] : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear the error for this field as the user edits it.
    setErrors((prev) => ({
      ...(prev ?? emptyErrors),
      [name]: "",
    }));

    // Any further edit means the previous server error is stale.
    if (apiError) setApiError(null);
  };

  const validateForm = () => {
    const newErrors: FormErrors = { ...emptyErrors };
    let valid = true;

    // Company Name
    if (!form.companyName.trim()) {
      newErrors.companyName = "Enter your company name";
      valid = false;
    } else if (form.companyName.trim().length < 5) {
      newErrors.companyName = "Company name needs at least 5 characters";
      valid = false;
    }

    // Full Name
    if (!form.fullName.trim()) {
      newErrors.fullName = "Enter your full name";
      valid = false;
    } else if (!/^[A-Za-z ]+$/.test(form.fullName)) {
      newErrors.fullName = "Full name can only contain letters and spaces";
      valid = false;
    }

    // Email
    if (!form.email.trim()) {
      newErrors.email = "Enter your email address";
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = "Enter a valid email address, like you@company.com";
      valid = false;
    }

    // Password
    if (!form.password) {
      newErrors.password = "Create a password";
      valid = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Password needs at least 8 characters";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setErrors(null);
    setApiError(null);
    setLoading(true);

    try {
      const response = await registerTenant(form);
      login(response.token);
      navigate("/dashboard");
    } catch (err: any) {
      setApiError(
        err.response?.data?.error ?? "Registration failed, please try again",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-2.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700
    bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white
    focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
    placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-shadow`;

  const labelClass =
    "text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-sm">
        {/* Logo + heading */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 mb-3">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            TenantFlow
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create your workspace
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
          {/* Gradient strip */}
          <div className="h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-blue-500" />

          <div className="px-6 py-8 flex flex-col gap-5">
            {errorMessages.length > 0 && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <svg
                  className="w-4 h-4 text-red-500 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>

                <p className="text-sm text-red-600 dark:text-red-400">
                  {errorMessages[0]}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Company */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Company Name</label>

                <input
                  name="companyName"
                  type="text"
                  placeholder="Acme Inc."
                  value={form.companyName}
                  onChange={handleChange}
                  className={`${inputClass} ${
                    errors?.companyName
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                />
                {errors?.companyName && (
                  <p className="text-xs text-red-500">{errors.companyName}</p>
                )}
              </div>
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Full Name</label>

                <input
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`${inputClass} ${
                    errors?.fullName ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
                {errors?.fullName && (
                  <p className="text-xs text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Email Address</label>

                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>

                  <input
                    name="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={handleChange}
                    className={`${inputClass} pl-10 ${
                      errors?.email ? "border-red-500 focus:ring-red-400" : ""
                    }`}
                  />
                </div>
                {errors?.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className={labelClass}>Password</label>

                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    className={`${inputClass} pl-10 pr-10 ${
                      errors?.password
                        ? "border-red-500 focus:ring-red-400"
                        : ""
                    }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors?.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-sm font-semibold rounded-lg
                           bg-indigo-600 hover:bg-indigo-700
                           text-white disabled:opacity-50
                           transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating workspace...
                  </>
                ) : (
                  "Create workspace"
                )}
              </button>
            </form>

            <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          TenantFlow · Multi-tenant project management
        </p>
      </div>
    </div>
  );
}
