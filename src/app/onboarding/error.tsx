"use client";

import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function Error(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <RouteErrorBoundary {...props} segment="onboarding" />;
}
