import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings as SettingsIcon, User, Mail, Shield } from "lucide-react";

export function ParentSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-700" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">
              {user?.name || "Not set"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="px-4 py-2 bg-gray-50 rounded-md text-gray-900">
              {user?.email || "Not set"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="px-4 py-2 bg-blue-50 rounded-md text-blue-800 font-medium">
              Parent
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-700" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Notification settings will be available soon. You'll be able to customize how you receive 
            updates about your child's progress, upcoming sessions, and teacher messages.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-700" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your account is secured with GitHub OAuth authentication. For additional security settings, 
            please contact support.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
