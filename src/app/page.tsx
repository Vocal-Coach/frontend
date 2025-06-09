"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="flex flex-col justify-between items-center text-center h-full p-8">
      <div className="mt-8 flex items-center justify-between w-full">
        <h2 className="text-2xl font-semibold tracking-tight text-gray-700">
          VocalFlow
        </h2>
        {isAuthenticated && (
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            로그아웃
          </button>
        )}
      </div>

      <div className="flex flex-col items-center">
        <h1 className="text-5xl font-bold leading-tight mb-4 text-gray-800">
          Find Your Voice.
        </h1>
        <p className="text-lg font-light max-w-xs text-gray-600">
          Personalized vocal coaching to elevate your singing. Start your
          journey to confident vocals today.
        </p>
      </div>

      <div className="w-full mb-8">
        {isAuthenticated ? (
          <Link href="/path-selection">
            <Button
              variant="primary"
              size="large"
              className="w-full max-w-xs mx-auto"
            >
              Get Started
            </Button>
          </Link>
        ) : (
          <Link href="/onboarding">
            <Button
              variant="primary"
              size="large"
              className="w-full max-w-xs mx-auto"
            >
              로그인 / 회원가입
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
