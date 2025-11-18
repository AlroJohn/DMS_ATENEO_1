import { ChartLineDots } from "@/components/reuseable/chart-line-dots";
import { ChartPieLabel } from "@/components/reuseable/chart-pie-label";
import { RecentDocuments } from "@/components/reuseable/recent-documents";
import { DocumentStatsCards } from "@/components/reuseable/document-stats-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, FileText, Users, AlertTriangle, Shield, Zap, CheckCircle, TrendingUp, Star } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 max-w-dvw">
      {/* Document Statistics Cards */}
      <DocumentStatsCards />
      
      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        <ChartPieLabel />
        <ChartLineDots />
      </div>

      {/* Quick Stats & Metrics - Row 1 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">activities this week</p>
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">awaiting your action</p>
          </CardContent>
        </Card>

        {/* Active Workflows */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-purple-600" />
              Active Workflows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">workflows running</p>
          </CardContent>
        </Card>

        {/* Collaborators */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              Collaborators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">team members</p>
          </CardContent>
        </Card>
      </div>

      {/* Storage & Compliance - Row 2 */}
      {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Storage Analytics */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Storage Usage
            </CardTitle>
            <CardDescription>Out of total allocated storage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>128 GB used</span>
                <span className="text-muted-foreground">1000 GB</span>
              </div>
              <Progress value={12.8} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">12.8% used</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="font-semibold">85 GB</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Images</p>
                <p className="font-semibold">32 GB</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Videos</p>
                <p className="font-semibold">11 GB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compliance & Security */}
        {/* <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Compliance Status
            </CardTitle>
            <CardDescription>System compliance score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Compliance Score</span>
                <span className="font-semibold">94%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Audit Trail</span>
                <Badge variant="outline" className="bg-green-50">Compliant</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Data Security</span>
                <Badge variant="outline" className="bg-green-50">Passed</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Blockchain</span>
                <Badge variant="outline" className="bg-green-50">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* System Activity & Top Documents - Row 2 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Recent System Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              System Activity
            </CardTitle>
            <CardDescription>Latest user actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Document "Annual Report" signed</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Workflow "Contract Approval" activated</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">3 documents uploaded to Finance</p>
                  <p className="text-xs text-muted-foreground">28 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Sarah Johnson shared 5 documents</p>
                  <p className="text-xs text-muted-foreground">45 minutes ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Top Documents
            </CardTitle>
            <CardDescription>Most accessed this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Q3 Financial Report</p>
                    <p className="text-xs text-muted-foreground">847 views</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Employee Handbook 2024</p>
                    <p className="text-xs text-muted-foreground">612 views</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">Project Alpha Proposal</p>
                    <p className="text-xs text-muted-foreground">428 views</p>
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 text-green-600 flex-shrink-0" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Statistics & Key Metrics - Row 3 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Department Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Finance</span>
                <span className="text-muted-foreground">342 docs</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>HR</span>
                <span className="text-muted-foreground">218 docs</span>
              </div>
              <Progress value={54} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Legal</span>
                <span className="text-muted-foreground">189 docs</span>
              </div>
              <Progress value={47} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Workflow Completion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Workflow Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Completed</span>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200">847</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">In Progress</span>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">156</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Pending</span>
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">42</Badge>
            </div>
            <div className="mt-4 p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Success Rate</p>
              <p className="text-lg font-bold">94.2%</p>
            </div>
          </CardContent>
        </Card>

        {/* Document Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Document Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Contracts</span>
              <span className="font-semibold">285</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Reports</span>
              <span className="font-semibold">412</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Policies</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Other</span>
              <span className="font-semibold">248</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents Section */}
      <div className="grid grid-cols-1 gap-4">
        <RecentDocuments />
      </div>

      {/* System Alerts & Notifications */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              Alerts & Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between">
                <span className="text-orange-900 dark:text-orange-100">2 Contracts expiring in 7 days</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">View</Button>
              </li>
              <li className="flex justify-between">
                <span className="text-orange-900 dark:text-orange-100">1 Document pending review</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">Review</Button>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-row gap-4 w-full">
        {/* Additional space for future components */}
      </div>
    </div>
  );
}
