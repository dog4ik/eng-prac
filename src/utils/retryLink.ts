import { AnyRouter } from "@trpc/server";
import { Unsubscribable, observable } from "@trpc/server/observable";
import { TRPCLink } from "@trpc/client/src/links/types";
import { TRPCClientError } from "@trpc/client";

const getRefresh_token = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("refresh_token");
  } else return null;
};
export function retryLink<TRouter extends AnyRouter = AnyRouter>(opts: {
  attempts: number;
  onError?: (err: TRPCClientError<TRouter>) => Promise<void>;
}): TRPCLink<TRouter> {
  // initialized config
  return () => {
    // initialized in app
    return ({ op, next }) => {
      // initialized for request
      return observable((observer) => {
        let next$: Unsubscribable | null = null;
        let attempts = 0;
        let isDone = false;
        function attempt() {
          attempts++;
          next$?.unsubscribe();
          next$ = next(op).subscribe({
            async error(error) {
              /* istanbul ignore if  */
              if (attempts > opts.attempts || !getRefresh_token()) {
                observer.error(error);
                return;
              }
              if (opts.onError) {
                await opts.onError(error);
              }
              attempt();
            },
            next(result) {
              observer.next(result);
            },
            complete() {
              if (isDone) {
                observer.complete();
              }
            },
          });
        }
        attempt();
        return () => {
          isDone = true;
          next$?.unsubscribe();
        };
      });
    };
  };
}
