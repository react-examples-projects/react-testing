import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, test, vi } from "vitest";
import DataTable, { type FeaturesType } from "@/components/DataTable";
import App from "@/App.tsx";
import type { Player } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import renderWithProviders from "./utils/renderWithProviders";

// Evita que el fetch real se dispare al importar App
// (leaderboardPromise a nivel de módulo usa este servicio)
vi.mock("@/services/chessApi", () => ({
  getDailyLeaderboard: vi.fn().mockResolvedValue([]),
}));

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const mockPlayers: Player[] = [
  {
    "@id": "https://api.chess.com/pub/player/magnuscarlsen",
    avatar: "https://images.chesscomfiles.com/uploads/v1/user/3884.225.225.0.0.0.12345.jpeg",
    country: "Norway",
    country_id: 12,
    draw_count: 250,
    flair_code: "flag-no",
    loss_count: 120,
    name: "Magnus Carlsen",
    player_id: 3884,
    rank: 1,
    score: 2882,
    status: "premium",
    title: "GM",
    url: "https://www.chess.com/member/magnuscarlsen",
    username: "magnuscarlsen",
    win_count: 1045,
    trend_rank: {
      direction: 0,
      delta: 0,
    },
    trend_score: {
      direction: 1,
      delta: 5,
    },
  },
  {
    "@id": "https://api.chess.com/pub/player/hikaru",
    avatar: "https://images.chesscomfiles.com/uploads/v1/user/154424.225.225.0.0.0.54321.jpeg",
    country: "United States",
    country_id: 1,
    draw_count: 310,
    flair_code: "flag-us",
    loss_count: 145,
    name: "Hikaru Nakamura",
    player_id: 154424,
    rank: 2,
    score: 2875,
    status: "premium",
    title: "GM",
    url: "https://www.chess.com/member/hikaru",
    username: "hikaru",
    win_count: 980,
    trend_rank: {
      direction: 1,
      delta: 1,
    },
    trend_score: {
      direction: 1,
      delta: 12,
    },
  },
  {
    "@id": "https://api.chess.com/pub/player/anonymous_grandmaster",
    avatar: "https://images.chesscomfiles.com/uploads/v1/user/default.jpeg",
    country: "Spain",
    country_id: 33,
    draw_count: 45,
    flair_code: "flag-es",
    loss_count: 20,
    // name se omite aquí ya que es opcional (name?: string)
    player_id: 987654,
    rank: 45,
    score: 2610,
    status: "basic",
    title: "IM",
    url: "https://www.chess.com/member/anon_gm",
    username: "anon_gm",
    win_count: 150,
    trend_rank: {
      direction: -1,
      delta: 3,
    },
    trend_score: {
      direction: -1,
      delta: 8,
    },
  },
];

export const columns: ColumnDef<FeaturesType, Player>[] = [
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "name",
    header: "Name",
    accessorFn(row) {
      const playerName = row.name ?? "--";
      return playerName;
    },
  },
  {
    accessorKey: "username",
    header: "Username",
  },
];

test("Render App", async () => {
  // act asíncrono: App contiene Suspense y suspende durante el render inicial
  await act(async () => {
    renderWithProviders(<App />);
  });

  // La tabla resolvió con datos vacíos (getDailyLeaderboard mockeado)
  await screen.findByText("No results.");

  // "Card Title"/"Card Description" aparecen en el Card principal y en CornerCard
  const titles = await screen.findAllByText("Card Title");
  expect(titles).toHaveLength(2);

  const descriptions = await screen.findAllByText("Card Description");
  expect(descriptions).toHaveLength(2);
});

test("render data table and find chess players", () => {
  const table = render(<DataTable columns={columns} data={mockPlayers} />);

  expect(table.container).toHaveTextContent("Status");
  expect(table.container).toHaveTextContent("Name");
  expect(table.container).toHaveTextContent("Username");

  expect(table.container).toHaveTextContent("Magnus Carlsen");
});

test("dislay the toast when the user clicks", async () => {
  renderWithProviders(
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
      <Toaster />
    </ThemeProvider>,
  );

  const button = screen.getByText("Mostrar Modal");
  button.click();

  await waitFor(() => {
    expect(screen.getByText("Successfully signed up!")).toBeInTheDocument();
  });
});
