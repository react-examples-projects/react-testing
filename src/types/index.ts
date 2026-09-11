export type Player = {
  "@id": string;
  avatar: string;
  country: string;
  country_id: number;
  draw_count: number;
  flair_code: string;
  loss_count: number;
  name?: string;
  player_id: number;
  rank: number;
  score: number;
  status: string;
  title: string;
  url: string;
  username: string;
  win_count: number;
  trend_rank: {
    direction: number;
    delta: number;
  };
  trend_score: {
    direction: number;
    delta: number;
  };
};