import { SHARED_QUESTION_COUNT } from "@/lib/comparison-data";

export default function StatusBar() {
  return (
    <footer className="status-bar">
      <div className="status-bar-left">
        <span className="status-item">class-profiles</span>
        <span className="status-item">3 cohorts</span>
        <span className="status-item">{SHARED_QUESTION_COUNT} shared questions</span>
      </div>
      <div className="status-bar-right">
        <a
          href="https://github.com/JusGu/class-profiles"
          target="_blank"
          rel="noreferrer"
          className="status-link"
        >
          source ↗
        </a>
      </div>
    </footer>
  );
}
