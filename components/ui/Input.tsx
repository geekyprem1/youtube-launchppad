import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        {...props}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors",
          "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          "placeholder:text-gray-400",
          error && "border-red-400 focus:border-red-400 focus:ring-red-100",
          className
        )}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <textarea
        {...props}
        className={cn(
          "w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors resize-none",
          "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
          "placeholder:text-gray-400",
          error && "border-red-400",
          className
        )}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
