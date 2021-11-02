export interface BookProps {
  _id?: string;
  title: string;
  dueDate: Date;
  date: Date;
  library: string;
  isAvailable: boolean;
  pages: number;
  position: BookPosition
}

export interface BookPosition{
  lat?: number,
  lng?: number
}