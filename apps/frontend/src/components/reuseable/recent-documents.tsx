import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const recentDocuments = [
  {
    id: 1,
    title: "Q3 Financial Report",
    sender: {
      name: "Olivia Martin",
      initials: "OM",
    },
    date: "5 minutes ago",
  },
  {
    id: 2,
    title: "Project Alpha Proposal",
    sender: {
      name: "Jackson Lee",
      initials: "JL",
    },
    date: "1 hour ago",
  },
  {
    id: 3,
    title: "Marketing Campaign Update",
    sender: {
      name: "Isabella Nguyen",
      initials: "IN",
    },
    date: "2 hours ago",
  },
  {
    id: 4,
    title: "HR Policy Changes",
    sender: {
      name: "William Kim",
      initials: "WK",
    },
    date: "3 hours ago",
  },
    {
    id: 5,
    title: "New Feature Spec",
    sender: {
      name: "Sofia Davis",
      initials: "SD",
    },
    date: "5 hours ago",
  },
];

export function RecentDocuments() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{doc.sender.initials}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{doc.title}</p>
                <p className="text-sm text-muted-foreground">
                  from {doc.sender.name}
                </p>
              </div>
              <div className="ml-auto font-medium text-sm text-muted-foreground">{doc.date}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
