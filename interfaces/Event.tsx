export interface Event {
   id: string;
   date: string;
   location: string;
   latitude?: number;
   longitude?: number;
   description?: string;
   severity?: 'low' | 'medium' | 'high';
   duration?: string;
   damage?: string;
}