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

export type SellerLink = {
  seller: string;
  url: string;
  // Lowest listed price including the seller's mandatory fees. Null when the
  // seller doesn't report an all-in price, so we never show a pre-fee price.
  allInPrice: number | null;
  currency: string | null;
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
  links: SellerLink[];
  status: TicketStatus;
  publicSaleStart: string | null;
  presales: Presale[];
};
