import { ChevronRight, Share, X } from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton, Panel } from "../../../shared/ui";

const DISMISSED_STORAGE_KEY = "gymtrack-ios-install-prompt-dismissed-v1";

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

export default function IosInstallPrompt() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    if (!isIosInstallEligible()) {
      return;
    }

    const wasDismissed =
      window.localStorage.getItem(DISMISSED_STORAGE_KEY) === "1";
    setShouldShow(!wasDismissed);
  }, []);

  function handleDismiss() {
    window.localStorage.setItem(DISMISSED_STORAGE_KEY, "1");
    setShouldShow(false);
  }

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 sm:inset-x-6 sm:bottom-6">
      <Panel className="pointer-events-auto mx-auto max-w-md border-sky-400/20 bg-[rgba(6,12,24,0.92)] p-4 shadow-[0_28px_70px_rgba(2,6,23,0.48)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-100">
            <Share size={18} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-(--text-strong)">
                  Install GymTrack
                </p>
                <p className="text-sm leading-5 text-(--text-soft)">
                  Tap Share, then Add to Home Screen.
                </p>
              </div>

              <IconButton
                tone="ghost"
                size="sm"
                className="h-8 w-8 rounded-lg"
                aria-label="Dismiss install instructions"
                title="Dismiss"
                onClick={handleDismiss}
              >
                <X size={14} />
              </IconButton>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-(--text-muted)">
              <span className="rounded-full border border-(--surface-border) bg-white/4 px-2.5 py-1 text-(--text-soft)">
                Share
              </span>
              <ChevronRight size={12} className="text-(--text-muted)" />
              <span className="rounded-full border border-(--surface-border) bg-white/4 px-2.5 py-1 text-(--text-soft)">
                Add to Home Screen
              </span>
            </div>

            <p className="mt-3 text-xs leading-5 text-(--text-muted)">
              If the option is missing, open GymTrack in Safari first.
            </p>
          </div>
        </div>
      </Panel>
    </div>
  );
}

function isIosInstallEligible() {
  if (typeof window === "undefined") {
    return false;
  }

  const navigatorWithStandalone = window.navigator as NavigatorWithStandalone;
  const userAgent = navigatorWithStandalone.userAgent.toLowerCase();
  const isIosDevice =
    /iphone|ipad|ipod/.test(userAgent) ||
    (navigatorWithStandalone.platform === "MacIntel" &&
      navigatorWithStandalone.maxTouchPoints > 1);

  if (!isIosDevice) {
    return false;
  }

  const isStandaloneFromMediaQuery =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;

  return (
    !isStandaloneFromMediaQuery && navigatorWithStandalone.standalone !== true
  );
}
