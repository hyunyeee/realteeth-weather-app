export type FavoriteLocation = {
  id: string;
  location: string;
  alias?: string;
};

export type AddFavoriteLocationPayload = {
  location: string;
  alias?: string;
};
