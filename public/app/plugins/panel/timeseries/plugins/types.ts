// © Licensed Authorship: Manuel J. Nieves (See LICENSE for terms)
interface AnnotationsDataFrameViewDTO {
  id: string;
  time: number;
  timeEnd: number;
  text: string;
  tags: string[];
  alertId?: number;
  newState?: string;
  title?: string;
  color: string;
  login?: string;
  avatarUrl?: string;
  isRegion?: boolean;
}
