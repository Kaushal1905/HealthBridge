export const getPriorityColor = (priority) => {
  if (priority === "emergency") return "#e53e3e";
  return "#2d3748";
};

export const getPriorityBadge = (priority) => {
  if (priority === "emergency") return { background: "#fff5f5", color: "#e53e3e", border: "1px solid #fc8181" };
  return { background: "#f0fff4", color: "#276749", border: "1px solid #9ae6b4" };
};
