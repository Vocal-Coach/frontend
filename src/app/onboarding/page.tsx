"use client";

import { useState } from "react";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import InputField from "@/components/ui/InputField";

export default function OnboardingPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "female", // 기본값은 female
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenderChange = (gender: string) => {
    setFormData({
      ...formData,
      gender,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Handle login
      console.log("Login:", {
        email: formData.email,
        password: formData.password,
      });
    } else {
      // Handle signup
      console.log("Signup:", formData);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      name: "",
      email: "",
      password: "",
      gender: "female",
    });
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md max-h-screen overflow-y-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VocalFlow</h1>
          <p className="text-gray-600">
            {isLogin ? "Welcome back!" : "Start your vocal journey"}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
          {/* Toggle Buttons */}
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                isLogin
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                !isLogin
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <InputField
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleInputChange}
              required={!isLogin}
              icon={User}
              isVisible={!isLogin}
            />
            <InputField
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
              required
              icon={Mail}
            />
            <InputField
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleInputChange}
              required
              icon={Lock}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            {/* Gender Toggle (Signup only) */}
            <div
              className={`transition-all duration-300 ${
                isLogin
                  ? "max-h-0 opacity-0 pointer-events-none"
                  : "max-h-24 opacity-100"
              }`}
            >
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <div className="flex bg-gray-100 rounded-2xl p-1">
                  <button
                    type="button"
                    onClick={() => handleGenderChange("female")}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-300 ${
                      formData.gender === "female"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Female
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenderChange("male")}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium transition-all duration-300 ${
                      formData.gender === "male"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Male
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center group mt-6"
            >
              {isLogin ? "Sign In" : "Create Account"}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
