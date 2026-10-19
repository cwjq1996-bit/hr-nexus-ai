import type { EmploymentStatus } from "../types/hr";

const COLOURS: Record<EmploymentStatus, { background: string; color: string }> = {
  Active: { background: "#dcfce7", color: "#166534" },
  "On leave": { background: "#fef3c7", color: "#92400e" },
  Probation: { background: "#dbeafe", color: "#1e40af" },
};

type Props = {
  status: EmploymentStatus;
};

function StatusBadge({ status }: Props) {
  const colours = COLOURS[status];
  return (
    <span
      style={{
        ...colours,
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 500,
      }}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
