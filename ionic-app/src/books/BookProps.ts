export interface BookProps {
  _id?: string;
  title: string;
  dueDate: Date;
  date: Date;
  library: string;
  isAvailable: boolean;
  pages: number;
}
