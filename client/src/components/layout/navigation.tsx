import { Link, useLocation } from "wouter";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "Stock Dashboard" },
    { path: "/portfolio", label: "Personal Portfolio" },
    { path: "/performance", label: "Performance" },
    { path: "/rebalance", label: "Rebalance Calculator" },
  ];

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => (
            <Link key={tab.path} href={tab.path}>
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  location === tab.path
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
