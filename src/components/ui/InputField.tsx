import React from "react";
import { Eye, EyeOff, LucideIcon } from "lucide-react";

interface InputFieldProps {
  type: "text" | "email" | "password";
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon: LucideIcon;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  isVisible?: boolean; // for animation
}

const InputField: React.FC<InputFieldProps> = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  icon: Icon,
  showPassword,
  onTogglePassword,
  isVisible = true,
}) => {
  const inputType = type === "password" && showPassword ? "text" : type;
  const hasPasswordToggle = type === "password";

  if (!isVisible) {
    return (
      <div className="transition-all duration-300 max-h-0 opacity-0 pointer-events-none">
        <div className="relative mb-4">
          <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 relative"
            required={required}
          />
          {hasPasswordToggle && onTogglePassword && (
            <button
              type="button"
              onClick={onTogglePassword}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="transition-all duration-300 max-h-24 opacity-100">
      <div className="relative mb-4">
        <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
        <input
          type={inputType}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 ${
            hasPasswordToggle ? "pr-12" : "pr-4"
          } py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 relative`}
          required={required}
        />
        {hasPasswordToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
