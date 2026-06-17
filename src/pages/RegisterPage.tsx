import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { registerTenant } from "../api/auth";

export default function RegisterPage(){

    const{ login } = useAuth();
    const navigate = useNavigate();
    const[error, setError] = useState<string | null>(null);
    const[loading, setLoading] = useState(false);
    const[form, setForm] = useState({
        companyName: "",
        fullName: "",
        email: "",
        password: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
            setForm({...form, [e.target.name] : e.target.value});
    };

    const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) =>{
            e.preventDefault();
            setError(null);
            setLoading(true);

            try{
                const response = await registerTenant(form);
                login(response.token);
                navigate("/dashboard");
            }catch(err: any){
                setError(err.response?.data?.error ?? "Registration failed. Please try again.");
            }finally{
                setLoading(false);
            }
    };

    return(
 <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow p-8">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                    Create your workspace
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Set up your company on TenantFlow
                </p>

                {error && (
                    <div className="mb-4 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Company name
                        </label>
                        <input
                            name="companyName"
                            type="text"
                            required
                            value={form.companyName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Your full name
                        </label>
                        <input
                            name="fullName"
                            type="text"
                            required
                            value={form.fullName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Work email
                        </label>
                        <input
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
                    >
                        {loading ? "Creating workspace..." : "Create workspace"}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );

}