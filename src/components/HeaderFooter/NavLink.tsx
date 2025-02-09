import { ReactNode, type FC } from "react";
import Link from "next/link";

/**
 * NavLink Props Interface
 */
interface NavLinkProps {
  href: string;
  label: ReactNode;
  active: boolean;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

/**
 * NavLink Component
 * Custom navigation link with active state and hover effects
 */
const NavLink: FC<NavLinkProps> = ({
  href,
  label,
  active,
  onClick,
  className = "",
}) => {
  const activeClass = active
    ? "bg-gradient-to-r from-blue-500 to-green-500 text-transparent bg-clip-text"
    : "";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative font-Teknaf ${className} ${activeClass} text-white`}
    >
      {label}
      <span
        className="absolute bottom-0 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"
        aria-hidden="true"
      ></span>
    </Link>
  );
};

export default NavLink;
