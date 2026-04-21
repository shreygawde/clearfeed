import SourceLensBadge from "./SourceLensBadge";
import { useNavigate } from "react-router-dom";

export default function NewsCard({ article, compact = false }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/article", { state: article })}
      className="relative group w-full cursor-pointer"
    >

      {/* Glow */}
      <div className="absolute -inset-2 bg-cyan-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition duration-500" />

      {/* Card */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-[#1E293B] bg-[#121821]/70 backdrop-blur-xl shadow-xl transition-all duration-500 group-hover:scale-[1.02]">

        {/* Image */}
        <div className={`relative ${compact ? "h-[160px]" : "h-[60vh] max-h-[500px]"}`}>
          <img
            src={article.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2">

          <div className="flex justify-between text-xs text-gray-400">
            <span>{article.source?.name}</span>
            <SourceLensBadge type={article.type} />
          </div>

          <h1 className="text-sm md:text-base font-semibold leading-tight line-clamp-2">
            {article.title}
          </h1>

          <p className="text-xs text-gray-300 line-clamp-2">
            {article.description}
          </p>

        </div>
      </div>
    </div>
  );
}