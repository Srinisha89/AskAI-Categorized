export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  videoUrl: string;
  views: string;
  duration: string;
  author: string;
  uploadDate: string;
  tags: string[];
  likes: number;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  date: string;
}
