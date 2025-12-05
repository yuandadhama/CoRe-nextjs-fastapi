interface ButtonProps {
  text: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button = ({
  text,
  onClick,
  className = "",
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        px-6 
        py-2.5
        rounded-xl 
        font-bold
        text-white 
        shadow-md
        transition-all 
        duration-200
        cursor-pointer
        ${
          disabled
            ? "bg-gray-600 opacity-50 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        }

        ${className}
      `}
    >
      {text}
    </button>
  );
};

export default Button;
