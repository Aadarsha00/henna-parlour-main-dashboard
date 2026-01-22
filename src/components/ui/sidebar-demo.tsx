import { useState, useEffect, useContext } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar";
import {
  IconLayoutDashboard,
  IconBriefcase,
  IconCalendar,
  IconArticle,
  IconPhoto,
  IconArrowLeft,
  IconMenu2,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AuthContext } from "@/context/AuthContext";

export function SidebarDemo({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Get the logout function from AuthContext
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("SidebarDemo must be used within an AuthProvider");
  }

  const { logout } = authContext;

  const handleLogout = () => {
    console.log("Logout initiated");

    // Use the context's logout method (it already clears localStorage)
    logout();

    // Close sidebar on mobile after logout
    if (isMobile) {
      setOpen(false);
    }

    // Navigate to login with replace to prevent back navigation
    navigate("/login", { replace: true });
  };

  // Check if device is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || !open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.querySelector('[data-sidebar="true"]');
      if (sidebar && !sidebar.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, open]);

  // Handle Escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open && isMobile) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isMobile]);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Services",
      href: "/services",
      icon: (
        <IconBriefcase className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Appointments",
      href: "/appointments",
      icon: (
        <IconCalendar className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Blog",
      href: "/blog",
      icon: (
        <IconArticle className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "Gallery",
      href: "/gallery",
      icon: (
        <IconPhoto className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-neutral-800"
      )}
    >
      {/* Mobile backdrop */}
      {isMobile && open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        data-sidebar="true"
        className={cn("relative z-50", isMobile && "fixed inset-y-0 left-0")}
      >
        <Sidebar open={open} setOpen={setOpen} animate={true}>
          <SidebarBody className="justify-between gap-6">
            <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
              {/* Logo */}
              <Logo open={open} />

              <div
                className={cn("flex flex-col gap-2", open ? "mt-6" : "mt-4")}
              >
                {links.map((link, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      // Close sidebar on mobile when link is clicked
                      if (isMobile) {
                        setOpen(false);
                      }
                    }}
                  >
                    <SidebarLink link={link} />
                  </div>
                ))}

                {/* Enhanced logout button styled like SidebarLink */}
                <button
                  onClick={() => {
                    handleLogout();
                  }}
                  className={cn(
                    "flex items-center justify-start gap-2 group/sidebar py-2 -ml-3 text-sm font-normal text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors duration-150 rounded-md",
                    open ? "px-3" : "px-2 justify-center"
                  )}
                  title="Logout"
                >
                  <IconArrowLeft className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
                  {open && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className="text-neutral-700 dark:text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150"
                    >
                      Logout
                    </motion.span>
                  )}
                </button>
              </div>
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      {/* Main content area */}
      <div
        className={cn(
          "flex-1 relative overflow-hidden bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 transition-all duration-300"
        )}
      >
        {/* Mobile menu button */}
        {isMobile && (
          <button
            onClick={() => setOpen(true)}
            className="fixed top-4 left-4 z-30 p-2 rounded-md bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 md:hidden"
            aria-label="Open sidebar"
          >
            <IconMenu2 className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
          </button>
        )}

        {/* Content container - this is where your pages will render */}
        <main className="h-full w-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

interface LogoProps {
  open: boolean;
}

const Logo: React.FC<LogoProps> = ({ open }) => {
  const logoSrc = "/logo.png"; // Adjust your logo path if needed

  return (
    <div
      className={cn(
        "flex transition-all duration-300 ease-in-out items-center",
        open ? "flex-row w-full" : "flex-col w-full"
      )}
    >
      <img
        src={logoSrc}
        alt="Logo"
        width={open ? 240 : 48} // explicit width in px
        height={open ? 50 : 48} // explicit height in px
        className={cn(
          "transition-all duration-300 ease-in-out object-contain",
          open ? "w-[240px] h-[50px]" : "w-12 h-12"
        )}
        style={{ display: "block" }}
      />
    </div>
  );
};

export default Logo;
