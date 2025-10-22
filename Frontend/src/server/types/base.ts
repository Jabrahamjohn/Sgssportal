export type ApiResponseType<DataType = undefined> = {
  success: boolean;
  message?: string;
  data: DataType;
};

export type ApiPaginatedResponseType<DataType = undefined> = {
  success: boolean;
  message?: string;
  pagination: {
    pages: number;
    prev: number;
    next: number;
    total: number;
  };
  data: DataType[];
};
