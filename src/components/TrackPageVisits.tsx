import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { generateUniqueId } from "~/utils/generateUniqueId";
import { useSession } from "next-auth/react";
import { isMobile, isTablet, isDesktop } from "react-device-detect";

const TrackPageVisits = () => {
  const logVisitMutation = api.analytics.logVisit.useMutation();
  const updateVisitMutation = api.analytics.updateVisit.useMutation();
  const updateNullEntriesMutation = api.analytics.updateNullEntries.useMutation();
  const syncTimerMutation = api.analytics.updateVisit.useMutation();

  const router = useRouter();
  const timerRef = useRef<number>(0);
  const uniqueIdRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { data: session } = useSession();
  const session_user = session?.user.email || "";

  // State to track device readiness
  const [deviceType, setDeviceType] = useState<string | null>(null);

  useEffect(() => {
    const determineDeviceType = () => {
      if (isMobile) return "mobile";
      if (isTablet) return "tablet";
      if (isDesktop) return "desktop";
      return "unknown"; // Fallback
    };

    // Set device type once determined
    setDeviceType(determineDeviceType());
  }, []);

  useEffect(() => {
    // Ensure deviceType is determined before proceeding
    if (!deviceType) return;

    const handlePageVisit = () => {
      const routePath = router.asPath;
      const allowedPaths = ["/captures", "/about", "/our-team"];
      const isAllowedPath = routePath === "/" || allowedPaths.some((path) => routePath.startsWith(path));

      if (!isAllowedPath) return;
      
      const uniqueId = generateUniqueId();
      uniqueIdRef.current = uniqueId;

      // First, update null entries
      updateNullEntriesMutation.mutate(
        { session_user },
        {
          onSuccess: () => {
            // Log visit once null entries are updated
            logVisitMutation.mutate(
              { session_user, uniqueId, routePath, device: deviceType }, 
              {
                onError: (error) => console.error("Error logging visit:", error),
              }
            );
          },
          onError: (error) => console.error("Error updating null entries:", error),
        }
      );

      timerRef.current = 0;

      // Clear any existing intervals
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);

      // Start visit duration timer
      intervalRef.current = setInterval(() => {
        timerRef.current++;
      }, 1000);

      // Sync timer every 20 seconds
      syncIntervalRef.current = setInterval(() => {
        if (uniqueIdRef.current) {
          syncTimerMutation.mutate({
            uniqueId: uniqueIdRef.current,
            timer: timerRef.current,
          });
        }
      }, 20000);
    };

    const handlePageExit = () => {
      if (uniqueIdRef.current) {
        updateVisitMutation.mutate({
          uniqueId: uniqueIdRef.current,
          timer: timerRef.current,
        });
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };

    if (document.readyState === "complete") {
      handlePageVisit();
    } else {
      window.addEventListener("load", handlePageVisit);
    }

    window.addEventListener("beforeunload", handlePageExit);
    return () => {
      handlePageExit();
      window.removeEventListener("load", handlePageVisit);
      window.removeEventListener("beforeunload", handlePageExit);
    };
  }, [router.asPath, deviceType]); // Depend on deviceType to ensure it's available

  return null;
};

export default TrackPageVisits;
