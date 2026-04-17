import { Link } from "react-router";
import { User, Wrench, Shield, Crown } from "lucide-react";

export function RoleSelector() {
  const roles = [
    {
      id: "client",
      name: "Client",
      description: "Track projects and manage construction journey",
      icon: User,
      color: "emerald"
    },
    {
      id: "engineer",
      name: "Engineer",
      description: "Review projects and manage assignments",
      icon: Wrench,
      color: "blue"
    },
    {
      id: "admin",
      name: "Admin",
      description: "Monitor platform operations",
      icon: Shield,
      color: "purple"
    },
    {
      id: "super-admin",
      name: "Super Admin",
      description: "Full platform control and analytics",
      icon: Crown,
      color: "orange"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Select Your Role
          </h1>
          <p className="text-xl text-gray-300">
            Choose a dashboard view to explore
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Link
                key={role.id}
                to={`/dashboard/${role.id}`}
                className="bg-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`h-16 w-16 bg-${role.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`h-8 w-8 text-${role.color}-600`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {role.name}
                </h2>
                <p className="text-gray-600">
                  {role.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/"
            className="text-white hover:text-emerald-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
