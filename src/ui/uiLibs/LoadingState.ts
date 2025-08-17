
export type LoadingState<Result> =
   |  { state: 'LOADING_INIT' }
   |  { state: 'LOADING_IN_PROGRESS' }
   |  {
         state: 'LOADING_SUCCESS'
         result: Result;
      }
   |  {
         state: 'LOADING_ERR',
         errorMessage: string;
      }
   ;