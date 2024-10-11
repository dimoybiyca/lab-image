export type TStatusType = 'success' | 'error' | 'warning' | 'info';

export type TStatus = {
  type: TStatusType;
  message: string;
};
