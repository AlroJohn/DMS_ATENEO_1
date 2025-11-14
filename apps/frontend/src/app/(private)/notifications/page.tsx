"use client";

import { useState } from "react";
import { Bell, Settings, CheckCheck, Eye, FileText, CheckCircle, PenTool, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function NotificationsPage() {
  const [frequency, setFrequency] = useState("immediate");
  
  const notifications = [
    {
      id: 1,
      type: "document_signed",
      title: "Document Signed",
      message: "Contract ABC-123 has been signed by John Doe",
      time: "2 minutes ago",
      read: false,
      icon: PenTool,
      color: "text-purple-600"
    },
    {
      id: 2,
      type: "document_received",
      title: "New Document Received",
      message: "You have received a new document for review",
      time: "1 hour ago",
      read: false,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "workflow_approved",
      title: "Workflow Approved",
      message: "Your document has been approved and moved to the next stage",
      time: "3 hours ago",
      read: true,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 4,
      type: "blockchain_verified",
      title: "Blockchain Verification Complete",
      message: "Document verification on blockchain completed successfully",
      time: "1 day ago",
      read: true,
      icon: AlertTriangle,
      color: "text-orange-600"
    }
  ];

  const notificationTypes = [
    { icon: FileText, title: "Document Updates", description: "New, edited, or deleted documents", color: "bg-blue-50" },
    { icon: CheckCircle, title: "Workflow Events", description: "Approvals, rejections, and routing", color: "bg-green-50" },
    { icon: PenTool, title: "Signature Events", description: "Document signing and verification", color: "bg-purple-50" },
    { icon: AlertTriangle, title: "System Alerts", description: "Security and system notifications", color: "bg-orange-50" }
  ];

  return (
    <div className="flex h-full flex-col gap-6 px-4 pb-4 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">Manage your notifications and preferences</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Notifications List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.map((notification) => {
                  const Icon = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`p-6 hover:bg-accent/50 transition-colors ${
                        !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg bg-background ${notification.color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold">{notification.title}</h4>
                              <p className="text-muted-foreground text-sm mt-1">{notification.message}</p>
                            </div>
                            {!notification.read && (
                              <Badge variant="default" className="ml-2">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <span className="text-xs text-muted-foreground">{notification.time}</span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              {!notification.read && (
                                <Button variant="ghost" size="sm">
                                  <CheckCheck className="h-3 w-3 mr-1" />
                                  Mark Read
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Email Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-signed" defaultChecked />
                    <Label htmlFor="email-signed" className="text-sm">Document signed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-received" defaultChecked />
                    <Label htmlFor="email-received" className="text-sm">Document received</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="email-workflow" />
                    <Label htmlFor="email-workflow" className="text-sm">Workflow updates</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">In-App Notifications</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="app-realtime" defaultChecked />
                    <Label htmlFor="app-realtime" className="text-sm">Real-time notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="app-sound" />
                    <Label htmlFor="app-sound" className="text-sm">Sound notifications</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="hourly">Hourly Digest</SelectItem>
                    <SelectItem value="daily">Daily Digest</SelectItem>
                    <SelectItem value="weekly">Weekly Digest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificationTypes.map((type, index) => {
                const Icon = type.icon;
                return (
                  <div key={index} className={`flex items-center gap-3 p-3 rounded-lg ${type.color}`}>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{type.title}</p>
                      <p className="text-xs text-muted-foreground">{type.description}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}