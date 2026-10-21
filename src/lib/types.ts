export type Artist = {
  id: string;
  name: string;
  imageUrl: string | null;
  genre: string | null;
  upcomingShows: number;
};

export type Presale = {
  name: string;
  start: string | null;
  end: string | null;
};

export type TicketStatus =
  | "announced"
  | "presale"
  | "onsale"
  | "offsale"
  | "cancelled"
  | "rescheduled";

export type Show = {
  id: string;
  name: string;
  date: string | null;
  time: string | null;
  timezone: string | null;
  venue: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  url: string | null;
  status: TicketStatus;
  publicSaleStart: string | null;
  presales: Presale[];
  priceMin: number | null;
  priceMax: number | null;
  currency: string | null;
};
