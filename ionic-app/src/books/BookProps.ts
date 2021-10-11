export interface BookProps {
  id?: string;
  title: string;
  dueDate: Date;
  date: Date;
  library: string;
  isAvailable: boolean;
  pages: number;
}
