type Props = {
  label: string;
  value: number;
  hint?: string;
};

function StatCard({ label, value, hint }: Props) {
  return (
    <div
      style={{
        flex: "1 1 200px",
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.1)",
        textAlign: "left",
      }}
    >
      <div style={{ fontSize: "14px", color: "#64748b" }}>{label}</div>
      <div
        style={{
          fontSize: "32px",
          fontWeight: 600,
          color: "#0f172a",
          margin: "4px 0",
        }}
      >
        {value}
      </div>
      {hint ? (
        <div style={{ fontSize: "13px", color: "#94a3b8" }}>{hint}</div>
      ) : null}
    </div>
  );
}

export default StatCard;
