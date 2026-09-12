import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable, { type FeaturesType } from "@/components/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import type { Player } from "@/types";
import "./App.css";
import { Suspense, use, useTransition, type SubmitEvent } from "react";
import { getDailyLeaderboard } from "@/services/chessApi";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ChartAreaLinear } from "@/components/ChartAreaLinear";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import CornerCard from "@/components/CornerCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQuery } from "@tanstack/react-query";
// eslint-disable-next-line react-refresh/only-export-components
export const columns: ColumnDef<FeaturesType, Player>[] = [
  {
    accessorKey: "status",
    header: "Status",
    accessorFn(row) {
      return row.status ?? "--";
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    accessorFn(row) {
      return row.name ?? "--";
    },
  },
  {
    accessorKey: "username",
    header: "Username",
    accessorFn(row) {
      return row.username ?? "--";
    },
  },
];

const leaderboardPromise = getDailyLeaderboard();

function DisplayTable() {
  const data = use(leaderboardPromise);
  return <DataTable data={data} columns={columns} />;
}

const SKELETON_ROWS = 10;

function TableSkeleton() {
  return (
    <Card className="w-full" data-element="loader">
      <CardHeader>
        <Skeleton className="h-10 w-full" />
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        {Array.from({ length: SKELETON_ROWS }).map((_, index) => (
          <Skeleton key={index} className="aspect-video w-full h-9" />
        ))}
      </CardContent>
    </Card>
  );
}

function App() {
  const { isPending, data, error, isError, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts");
      return response.json();
    },
  });
  const [isLoading, startTransition] = useTransition();

  const displayToast = () => {
    toast("Successfully signed up!");
  };

  const sendPost = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const data = new FormData(e.target);
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: data,
      });

      const result = await response.json();
      console.log(result);
    });
  };

  return (
    <div className="max-w-3xl mx-auto my-5">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
          <CardAction>Card Action</CardAction>
        </CardHeader>
        <CardContent>
          <p>Card Content</p>
        </CardContent>
        <CardFooter>
          <p>Card Footer</p>
        </CardFooter>
      </Card>

      <ChartAreaLinear className="my-5" />

      <Button className="mb-3 cursor-pointer" onClick={displayToast}>
        Mostrar Modal
      </Button>

      <CornerCard
        title="Card Title"
        status="ACTIVE"
        description="Card Description"
        version="2.4.1"
        className="mb-3"
      />

      <form onSubmit={sendPost} className="my-8">
        <Input placeholder="Title post" className="mb-3" name="title" />
        <Textarea className="min-h-32 mb-3" name="body" placeholder="Post content" />
        <Button disabled={isLoading} type="submit">
          {isLoading ? "Sending..." : "Send Post"}
        </Button>
      </form>

      <ErrorBoundary>
        <Suspense fallback={<TableSkeleton />}>
          <DisplayTable />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;
