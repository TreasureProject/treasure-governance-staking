import type { ReactNode } from "react";

// Icon creation factory
const createIcon = ({
  path,
  displayName,
}: {
  path: ReactNode;
  displayName: string;
}) => {
  const Comp = (props: React.SVGAttributes<SVGElement>) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      {path}
    </svg>
  );

  Comp.displayName = displayName;

  return Comp;
};

export const SpinnerIcon = createIcon({
  path: (
    <>
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </>
  ),
  displayName: "SpinnerIcon",
});
