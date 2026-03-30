import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Mail, Send, Clock, CheckCircle, XCircle, Plus } from "lucide-react";

export default function EmailAutomation() {
  const [activeTab, setActiveTab] = useState<"campaigns" | "sequences" | "queue" | "logs">("campaigns");

  // Mock data for demonstration
  const campaigns = [
    {
      id: 1,
      name: "Diagnostic Test Follow-up",
      description: "4-email sequence sent after diagnostic test completion",
      triggerEvent: "diagnostic_test_completed",
      enabled: 1,
      sequenceCount: 4,
      totalSent: 1247,
    },
    {
      id: 2,
      name: "Welcome Series",
      description: "3-email welcome sequence for new students",
      triggerEvent: "student_registered",
      enabled: 1,
      sequenceCount: 3,
      totalSent: 892,
    },
  ];

  const sequences = [
    { id: 1, campaignId: 1, order: 1, delayDays: 0, subject: "Thank you for completing the diagnostic test!", sent: 312 },
    { id: 2, campaignId: 1, order: 2, delayDays: 2, subject: "Your personalized learning path is ready", sent: 298 },
    { id: 3, campaignId: 1, order: 3, delayDays: 6, subject: "Special offer: Start your 5QHackMath journey", sent: 276 },
    { id: 4, campaignId: 1, order: 4, delayDays: 13, subject: "Last chance: Exclusive discount ending soon", sent: 245 },
  ];

  const queueItems = [
    { id: 1, recipientEmail: "parent1@example.com", subject: "Thank you for completing...", scheduledFor: "2026-01-24 10:00", status: "pending" },
    { id: 2, recipientEmail: "parent2@example.com", subject: "Your personalized learning...", scheduledFor: "2026-01-24 14:30", status: "pending" },
    { id: 3, recipientEmail: "parent3@example.com", subject: "Special offer: Start your...", scheduledFor: "2026-01-25 09:15", status: "pending" },
  ];

  const logs = [
    { id: 1, recipientEmail: "parent4@example.com", subject: "Thank you for completing...", sentAt: "2026-01-23 08:30", opened: 1, clicked: 1 },
    { id: 2, recipientEmail: "parent5@example.com", subject: "Your personalized learning...", sentAt: "2026-01-23 09:45", opened: 1, clicked: 0 },
    { id: 3, recipientEmail: "parent6@example.com", subject: "Special offer: Start your...", sentAt: "2026-01-23 11:20", opened: 0, clicked: 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Email Automation</h2>
          <p className="text-gray-600 mt-1">Manage automated email campaigns and sequences</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">2</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Sent</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">2,139</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Queue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">67%</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-4">
          {["campaigns", "sequences", "queue", "logs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{campaign.name}</CardTitle>
                    <CardDescription>{campaign.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      campaign.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                    }`}>
                      {campaign.enabled ? "Active" : "Paused"}
                    </span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Trigger Event</p>
                    <p className="font-medium">{campaign.triggerEvent.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sequences</p>
                    <p className="font-medium">{campaign.sequenceCount} emails</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Sent</p>
                    <p className="font-medium">{campaign.totalSent.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "sequences" && (
        <Card>
          <CardHeader>
            <CardTitle>Email Sequences - Diagnostic Test Follow-up</CardTitle>
            <CardDescription>4-email sequence sent over 14 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sequences.map((seq) => (
                <div key={seq.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-bold">
                      {seq.order}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{seq.subject}</p>
                      <p className="text-sm text-gray-600">Day {seq.delayDays} • {seq.sent} sent</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "queue" && (
        <Card>
          <CardHeader>
            <CardTitle>Email Queue</CardTitle>
            <CardDescription>Scheduled emails waiting to be sent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Recipient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Scheduled For</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {queueItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{item.recipientEmail}</td>
                      <td className="py-3 px-4">{item.subject}</td>
                      <td className="py-3 px-4">{item.scheduledFor}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "logs" && (
        <Card>
          <CardHeader>
            <CardTitle>Email Logs</CardTitle>
            <CardDescription>Recently sent emails with engagement metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Recipient</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sent At</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Opened</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{log.recipientEmail}</td>
                      <td className="py-3 px-4">{log.subject}</td>
                      <td className="py-3 px-4">{log.sentAt}</td>
                      <td className="py-3 px-4">
                        {log.opened ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {log.clicked ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
