export interface VAI_SearchData {
  query: string,
  results: Record<string, Record<string, any>>
}

export interface VAI_APIStore {
  get(): any;
}