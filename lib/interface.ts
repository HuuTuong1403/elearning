export interface ISearchResponse<T> {
  data: T;
  status: number;
}

export interface IActionResponse {
  message: string;
  status: number;
}
