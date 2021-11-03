import {Photo} from "../photos/usePhoto";

export interface BookProps {
  _id?: string;
  title: string;
  dueDate: Date;
  date: Date;
  library: string;
  isAvailable: boolean;
  pages: number;
  image?: Photo
  position: BookPosition
}

export interface BookPosition{
  lat?: number,
  lng?: number
}