import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Bell, Mail, MessageSquare, CheckCircle, AlertCircle, Trophy, BookOpen, Filter } from "lucide-react";

export default function ParentNotifications() {
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");

  // Mock data for demonstration
  const notifications = [
    {
      id: 1,
      studentName: "Emma Johnson",
      type: "lesson_completed",
      title: "Lesson Completed: Fractions Basics",
      message: "Emma has successfully completed the Fractions Basics lesson with a score of 9/10. Great work!",
      priority: "medium",
      read: 0,
      sentViaEmail: 1,
      sentViaSms: 0,
      createdAt: "2026-01-23T10:30:00",
    },
    {
      id: 2,
      studentName: "Emma Johnson",
      type: "badge_earned",
      title: "Achievement Unlocked: Silver Badge!",
      message: "Congratulations! Emma has earned a Silver Badge for completing 25 lessons. This is a significant milestone!",
      priority: "high",
      read: 0,
      sentViaEmail: 1,
      sentViaSms: 1,
      createdAt: "2026-01-23T09:15:00",
    },
    {
      id: 3,
      studentName: "Emma Johnson",
      type: "needs_attention",
      title: "Learning Support Needed",
      message: "Emma has attempted the Decimals lesson 3 times without reaching the 8/10 threshold. Consider scheduling a teacher session for additional support.",
      priority: "high",
      read: 1,
      sentViaEmail: 1,
      sentViaSms: 0,
      createdAt: "2026-01-22T14:20:00",
      readAt: "2026-01-22T15:30:00",
    },
    {
      id: 4,
      studentName: "Emma Johnson",
      type: "weekly_summary",
      title: "Weekly Progress Summary",
      message: "This week Emma completed 4 lessons, achieved 2 perfect scores, and maintained a 5-day learning streak. Total time spent: 3.5 hours.",
      priority: "low",
      read: 1,
      sentViaEmail: 1,
      sentViaSms: 0,
      createdAt: "2026-01-21T18:00:00",
      readAt: "2026-01-21T19:45:00",
    },
  ];

  const getTypeIcon = (type: string) => {
    if (type === "lesson_completed") return <BookOpen className="w-5 h-5 text-blue-600" />;
    if (type === "badge_earned") return <Trophy className="w-5 h-5 text-yellow-600" />;
    if (type === "needs_attention") return <AlertCircle className="w-5 h-5 text-red-600" />;
    if (type === "weekly_summary") return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <Bell className="w-5 h-5 text-gray-600" />;
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high") return "border-l-4 border-l-red-500 bg-red-50";
    if (priority === "medium") return "border-l-4 border-l-yellow-500 bg-yellow-50";
    return "border-l-4 border-l-green-500 bg-green-50";
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return notif.read === 0;
    if (filter === "high") return notif.priority === "high";
    return true;
  });

  const unreadCount = notifications.filter((n) => n.read === 0).length;
  const highPriorityCount = notifications.filter((n) => n.priority === "high" && n.read === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 mt-1">Stay updated on your child's learning progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
          >
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "high" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("high")}
          >
            <AlertCircle className="w-4 h-4 mr-1" />
            High Priority ({highPriorityCount})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Notifications</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{unreadCount}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{highPriorityCount}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Via SMS</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {notifications.filter((n) => n.sentViaSms === 1).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
          <CardDescription>Updates about your child's learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No notifications match your filter</p>
              </div>
            ) : (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg ${getPriorityColor(notif.priority)} ${
                    notif.read === 0 ? "shadow-md" : "opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">{getTypeIcon(notif.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                          {notif.read === 0 && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{notif.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span>{notif.studentName}</span>
                          <span>•</span>
                          <span>{new Date(notif.createdAt).toLocaleString()}</span>
                          {notif.sentViaEmail === 1 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" /> Email sent
                              </span>
                            </>
                          )}
                          {notif.sentViaSms === 1 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" /> SMS sent
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {notif.read === 0 && (
                      <Button variant="outline" size="sm">
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to receive updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Lesson Completion</p>
                <p className="text-sm text-gray-600">Get notified when your child completes a lesson</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  SMS
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Achievement Badges</p>
                <p className="text-sm text-gray-600">Get notified when your child earns a badge</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  SMS
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Needs Attention</p>
                <p className="text-sm text-gray-600">Get notified when your child needs learning support</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  SMS
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Weekly Summary</p>
                <p className="text-sm text-gray-600">Receive a weekly progress report every Sunday</p>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Email
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  SMS
                </label>
              </div>
            </div>
          </div>

          <Button className="mt-4 w-full">Save Preferences</Button>
        </CardContent>
      </Card>
    </div>
  );
}
