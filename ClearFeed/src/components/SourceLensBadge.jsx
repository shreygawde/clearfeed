export default function SourceLensBadge({ type }) {
  const styles = {
    breaking: "bg-green-500/10 text-green-400 border-green-500/30",
    report: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    analysis: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    opinion: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    controversial: "bg-red-500/10 text-red-400 border-red-500/30",
    general: "bg-gray-500/10 text-gray-300 border-gray-500/30",
  };

  const labels = {
    breaking: "⚡ BREAKING",
    report: "📊 REPORT",
    analysis: "🧠 ANALYSIS",
    opinion: "🗣 OPINION",
    controversial: "🔥 CONTROVERSY",
    general: "NEWS",
  };

  return (
    <span
      className={`px-3 py-1 text-xs rounded-full border ${styles[type] || styles.general}
                  backdrop-blur-md transition duration-300
                  hover:scale-105 hover:shadow-md`}
    >
      {labels[type] || "NEWS"}
    </span>
  );
}