import { useParams, Link } from "react-router";
import { useNavigate } from "react-router";
import { 
  LayoutDashboard,
  FileText,
  Calculator,
  Users,
  Settings,
  Home,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Briefcase,
  Shield,
  BarChart3,
  Bell,
  Search,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";

export function Dashboard() {
  const { role = "client" } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case "client":
        return [
          { icon: LayoutDashboard, label: "Overview", path: "#" },
          { icon: Home, label: "My Projects", path: "#" },
          { icon: Calculator, label: "Estimator", path: "/estimator" },
          { icon: FileText, label: "Plans", path: "/plans" },
          { icon: Users, label: "My Experts", path: "#" },
          { icon: Settings, label: "Settings", path: "#" },
        ];
      case "engineer":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "#" },
          { icon: Briefcase, label: "Assigned Projects", path: "#" },
          { icon: FileText, label: "Review Queue", path: "#" },
          { icon: Users, label: "Clients", path: "#" },
          { icon: BarChart3, label: "Performance", path: "#" },
          { icon: Settings, label: "Settings", path: "#" },
        ];
      case "admin":
        return [
          { icon: LayoutDashboard, label: "Dashboard", path: "#" },
          { icon: Users, label: "User Management", path: "#" },
          { icon: Shield, label: "Verifications", path: "#" },
          { icon: FileText, label: "Approvals", path: "#" },
          { icon: BarChart3, label: "Analytics", path: "#" },
          { icon: Settings, label: "Settings", path: "#" },
        ];
      case "super-admin":
        return [
          { icon: LayoutDashboard, label: "System Overview", path: "#" },
          { icon: Users, label: "All Users", path: "#" },
          { icon: Shield, label: "Platform Controls", path: "#" },
          { icon: BarChart3, label: "Analytics", path: "#" },
          { icon: Settings, label: "System Settings", path: "#" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleName = () => {
    const roleNames: { [key: string]: string } = {
      client: "Client",
      engineer: "Engineer",
      admin: "Admin",
      "super-admin": "Super Admin"
    };
    return roleNames[role] || "Client";
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Home className="h-5 w-5" />
            </div>
            <span className="font-bold">CivilBridge</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2 px-3">
              {getRoleName()} Portal
            </p>
          </div>
          <ul className="space-y-1">
            {navItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
            <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <span className="font-bold">JD</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-sm">John Doe</p>
              <p className="text-xs text-gray-400">{getRoleName()}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5 text-gray-600" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-600" />
                )}
              </button>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-96"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                <option value="client">Client View</option>
                <option value="engineer">Engineer View</option>
                <option value="admin">Admin View</option>
                <option value="super-admin">Super Admin View</option>
              </select>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {role === "client" && "Welcome back, John!"}
                {role === "engineer" && "Engineer Dashboard"}
                {role === "admin" && "Admin Dashboard"}
                {role === "super-admin" && "System Overview"}
              </h1>
              <p className="text-gray-600">
                {role === "client" && "Track your projects and manage your construction journey"}
                {role === "engineer" && "Manage your assignments and client reviews"}
                {role === "admin" && "Monitor platform operations and user activities"}
                {role === "super-admin" && "Full platform control and analytics"}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {role === "client" && (
                <>
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Home className="h-6 w-6 text-emerald-600" />
                      </div>
                      <span className="text-sm text-green-600 font-semibold">Active</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">3</p>
                    <p className="text-sm text-gray-600">Active Projects</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">12</p>
                    <p className="text-sm text-gray-600">Estimates Generated</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-teal-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">5</p>
                    <p className="text-sm text-gray-600">Saved Plans</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">RWF 185M</p>
                    <p className="text-sm text-gray-600">Total Budget</p>
                  </div>
                </>
              )}

              {role === "engineer" && (
                <>
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">8</p>
                    <p className="text-sm text-gray-600">Assigned Projects</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">4</p>
                    <p className="text-sm text-gray-600">Pending Reviews</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">47</p>
                    <p className="text-sm text-gray-600">Completed Reviews</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">4.9</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                </>
              )}

              {(role === "admin" || role === "super-admin") && (
                <>
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">2,847</p>
                    <p className="text-sm text-gray-600">Total Users</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Home className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">542</p>
                    <p className="text-sm text-gray-600">Active Projects</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">23</p>
                    <p className="text-sm text-gray-600">Pending Approvals</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">+18%</p>
                    <p className="text-sm text-gray-600">Growth This Month</p>
                  </div>
                </>
              )}
            </div>

            {/* Recent Activity / Projects */}
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  {role === "client" && "My Recent Projects"}
                  {role === "engineer" && "Recent Assignments"}
                  {(role === "admin" || role === "super-admin") && "Recent Activity"}
                </h2>

                <div className="space-y-4">
                  {role === "client" && (
                    <>
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="h-12 w-12 bg-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Home className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">4-Bedroom Modern House</h3>
                          <p className="text-sm text-gray-600">Gasabo District • RWF 58.5M</p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            In Progress
                          </span>
                          <p className="text-xs text-gray-500 mt-1">65% Complete</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Commercial Complex Plan</h3>
                          <p className="text-sm text-gray-600">Kimihurura • RWF 180M</p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                            Pending Review
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="h-12 w-12 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Home className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">3-Bedroom Villa</h3>
                          <p className="text-sm text-gray-600">Gacuriro • RWF 45M</p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            Planning
                          </span>
                          <p className="text-xs text-gray-500 mt-1">Started 2 days ago</p>
                        </div>
                      </div>
                    </>
                  )}

                  {role === "engineer" && (
                    <>
                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">Review: 5-Bedroom Villa Design</h3>
                            <p className="text-sm text-gray-600">Client: Marie Uwase</p>
                          </div>
                          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                            Urgent
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                            Review Now
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                            View Details
                          </button>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">Cost Estimation Review</h3>
                            <p className="text-sm text-gray-600">Client: Jean Mugabo</p>
                          </div>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            New
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                            Review Now
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                            View Details
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {(role === "admin" || role === "super-admin") && (
                    <>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-gray-900">New Engineer Registration</p>
                            <p className="text-sm text-gray-600">Patrick Niyonzima - Civil Engineer</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                          Review
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Project Approval Required</p>
                            <p className="text-sm text-gray-600">Commercial Complex - RWF 280M</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700">
                          Review
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-gray-900">134 New User Registrations</p>
                            <p className="text-sm text-gray-600">This week</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                          View All
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions / Stats */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    {role === "client" && (
                      <>
                        <Link
                          to="/estimator"
                          className="block w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-center"
                        >
                          New Estimate
                        </Link>
                        <Link
                          to="/plans"
                          className="block w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-center"
                        >
                          Browse Plans
                        </Link>
                        <Link
                          to="/marketplace"
                          className="block w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-center"
                        >
                          Find Expert
                        </Link>
                      </>
                    )}
                    {role === "engineer" && (
                      <>
                        <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          Review Queue
                        </button>
                        <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          My Projects
                        </button>
                        <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          Messages
                        </button>
                      </>
                    )}
                    {(role === "admin" || role === "super-admin") && (
                      <>
                        <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          Verify Users
                        </button>
                        <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          View Reports
                        </button>
                        <button className="w-full px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
                          System Settings
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-3">
                    <div className="pb-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">New message from Engineer</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <div className="pb-3 border-b border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">Estimate approved</p>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Payment confirmed</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}