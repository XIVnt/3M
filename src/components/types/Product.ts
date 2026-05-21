export type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  restaurantId: number;
  available?: boolean;
};