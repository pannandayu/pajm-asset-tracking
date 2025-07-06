import { useAuth } from "@/context/AuthContext";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { FormEvent, Fragment, useEffect, useState } from "react";

const Home: NextPage = () => {
  const auth = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const loginHandler = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const result = await auth.login(formData.username, formData.password);

      if (result.message) {
        throw new Error(result.message);
      }
      setError("");
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-amber-300 font-mono p-4 flex items-center justify-center">
      <Head>
        <title>Asset Management Portal</title>
        <meta
          name="description"
          content="Asset tracking and management system"
        />
      </Head>

      <main className="w-full max-w-md mx-auto">
        {/* Terminal Header */}
        <div className="bg-gray-800 border-2 border-amber-400 p-4 mb-6 text-center shadow-lg shadow-amber-400/20">
          <h1 className="text-2xl font-bold tracking-wider">
            ASSET TRACKING TERMINAL
          </h1>
          <p className="text-amber-400 text-sm mt-1">SECURED ACCESS SYSTEM</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900 text-red-200 border-2 border-red-500 p-3 mb-4 text-sm">
            SYSTEM ALERT: {error}
          </div>
        )}

        {/* Content Area */}
        <div className="bg-gray-800 border-2 border-amber-400 p-6 shadow-lg shadow-amber-400/10">
          {auth.user && auth.user.id ? (
            <Fragment>
              <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-amber-300 mb-1">
                  USER: {auth.user.name.toUpperCase()}
                </h2>
                <p className="text-amber-400 text-sm">
                  CLEARANCE: {auth.user.tagging === "0" ? "ALL" : "ADMIN"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-6">
                <Link href="/catalog" legacyBehavior>
                  <a className="block bg-gray-700 hover:bg-gray-600 border-2 border-amber-400 p-4 transition-all group">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3 text-amber-300">📋</span>
                      <div>
                        <h3 className="font-bold text-amber-300 group-hover:text-amber-200">
                          CATALOG MODULE
                        </h3>
                        <p className="text-xs text-amber-400">
                          Access asset database
                        </p>
                      </div>
                    </div>
                  </a>
                </Link>

                <Link href="/events" legacyBehavior>
                  <a className="block bg-gray-700 hover:bg-gray-600 border-2 border-amber-400 p-4 transition-all group">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3 text-amber-300">🗓️</span>
                      <div>
                        <h3 className="font-bold text-amber-300 group-hover:text-amber-200">
                          EVENT LOGS MODULE
                        </h3>
                        <p className="text-xs text-amber-400">
                          View asset's event
                        </p>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>

              <button
                onClick={async (e) => {
                  e.preventDefault();
                  try {
                    await auth.logout();
                  } catch (err) {
                    console.log(err);
                  }
                }}
                className="w-full bg-red-800 hover:bg-red-700 text-white border-2 border-red-500 py-2 px-4 font-bold transition-all"
              >
                LOGOUT
              </button>
            </Fragment>
          ) : (
            <Fragment>
              <div className="mb-6 text-center">
                <h1 className="text-xl font-bold border-b-2 border-amber-400 pb-2 inline-block">
                  SYSTEM LOGIN
                </h1>
              </div>

              <form onSubmit={loginHandler} className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-sm font-bold mb-1"
                    >
                      USER ID:
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      required
                      className="w-full bg-gray-900 border-2 border-amber-400 p-2 text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold mb-1"
                    >
                      ACCESS CODE:
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      required
                      className="w-full bg-gray-900 border-2 border-amber-400 p-2 text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-700 hover:bg-amber-600 text-black border-2 border-amber-500 py-2 px-4 font-bold transition-all"
                >
                  AUTHENTICATE
                </button>
              </form>
            </Fragment>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="bg-gray-800 border-2 border-amber-400 p-2 mt-4 text-center text-xs text-amber-400">
          PAJM SHIPYARD • TERMINAL
        </div>
      </main>
    </div>
  );
};

export default Home;
