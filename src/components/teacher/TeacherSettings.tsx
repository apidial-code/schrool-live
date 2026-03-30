import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings, User, Bell, Clock } from "lucide-react";
import { toast } from "sonner";

export default function TeacherSettings() {
  const { user } = useAuth();
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Australia/Sydney");

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully!");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification preferences saved!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900">Settings</h3>
        <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input value={user?.name || ""} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">Contact admin to change your name</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <Input value={user?.email || ""} disabled className="bg-gray-50" />
            <p className="text-xs text-gray-500 mt-1">Contact admin to change your email</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell students and parents about yourself..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specializations
            </label>
            <div className="flex flex-wrap gap-2">
              {["Year 5/6", "Year 7", "Year 8", "Year 9"].map((year) => (
                <span
                  key={year}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                >
                  {year}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">Contact admin to update your specializations</p>
          </div>

          <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Timezone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Australia/Sydney">Australia/Sydney (AEDT)</option>
              <option value="Australia/Melbourne">Australia/Melbourne (AEDT)</option>
              <option value="Australia/Brisbane">Australia/Brisbane (AEST)</option>
              <option value="Australia/Perth">Australia/Perth (AWST)</option>
              <option value="Australia/Adelaide">Australia/Adelaide (ACDT)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">All session times will be displayed in this timezone</p>
          </div>

          <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
            Save Timezone
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive emails for new messages and assignments</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Session Reminders</p>
                <p className="text-sm text-gray-600">Get reminders 24 hours before scheduled sessions</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Assignment Notifications</p>
                <p className="text-sm text-gray-600">Notify me when students submit assignments</p>
              </div>
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
              </div>
            </label>
          </div>

          <Button onClick={handleSaveNotifications} className="bg-blue-600 hover:bg-blue-700">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Account Information */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Account Type:</strong> Elite Teacher</p>
          <p>• <strong>Status:</strong> Active</p>
          <p>• <strong>Member Since:</strong> {new Date().toLocaleDateString()}</p>
          <p>• <strong>Support:</strong> For account issues, contact admin@schrool.com</p>
        </CardContent>
      </Card>
    </div>
  );
}
