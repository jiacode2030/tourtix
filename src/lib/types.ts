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
  // Sign-up or info page, e.g. Verified Fan registration.
  url: string | null;
  description: string | null;
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
  | "rescheduled"
  | "postponed"
  // Listed by a seller that doesn't tell us whether tickets are available.
  | "listed";

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
  lat: number | null;
  lng: number | null;
  // Extra info for the details panel; all optional.
  extras: ShowExtras;
};

export type ShowExtras = {
  seatmapUrl?: string;
  ticketLimit?: string;
  ageRestriction?: string;
  accessibility?: string;
  pleaseNote?: string;
  parking?: string;
};
