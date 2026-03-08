import { useEffect, useState } from "react";

export function useSubscription(subscribe: (listener: () => void) => () => void): number {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    return subscribe(() => setVersion((value) => value + 1));
  }, [subscribe]);

  return version;
}
