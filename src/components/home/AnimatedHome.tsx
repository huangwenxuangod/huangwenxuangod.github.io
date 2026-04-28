import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  CircleDot,
  FolderKanban,
  Route,
  Trophy,
} from "lucide-react";

export type HomeItem = {
  slug: string;
  title: string;
  date: string;
  description?: string;
};

type TimelineItem = HomeItem & {
  type: string;
  href: string;
};

type Props = {
  essays: HomeItem[];
  diaries: HomeItem[];
  projects: HomeItem[];
  achievements: HomeItem[];
  timeline: TimelineItem[];
};

function formatDateDot(ymd: string): string {
  const [y, m, d] = ymd.split("-");
  return `${y}.${m}.${d}`;
}

const reveal = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

const workMap = [
  { title: "AI 产品化", text: "把模型能力变成真实可用的工作流。", icon: Brain },
  { title: "内容系统", text: "从问题、选题、写作到发布复盘。", icon: BookOpen },
  { title: "自动化工作流", text: "减少重复动作，让系统替我记住过程。", icon: Route },
  { title: "个人商业模式", text: "围绕自由、现金流和长期能力做实验。", icon: CircleDot },
];

export default function AnimatedHome({
  essays,
  diaries,
  projects,
  achievements,
  timeline,
}: Props) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 28, restDelta: 0.001 });

  return (
    <div className="home-system">
      <motion.div className="scroll-progress" style={{ scaleX }} />

      <motion.section
        className="identity-grid"
        variants={reveal}
        initial="hidden"
        animate="show"
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <aside className="identity-side">
          <span>WENXUAN / ROAD</span>
          <strong>Building in public</strong>
          <p>AI / 内容 / 产品 / 自动化 / 自由职业</p>
        </aside>

        <div className="identity-main">
          <span className="section-label">Who I am</span>
          <h1>文轩的自由之路</h1>
          <p>
            我把想法推进成项目，把项目沉淀成结果，再把过程写回思考。这里是我的公开档案，也是一路走出来的痕迹。
          </p>
        </div>

        <aside className="quote-card">
          <span>Quote</span>
          <blockquote>
            世上本没有路，走的人多了，也便成了路。我的自由之路也是这样：先走，再记录。
          </blockquote>
        </aside>
      </motion.section>

      <motion.section
        className="wide-section now-section"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        <div className="section-index">
          <span>01</span>
          <strong>正在做什么</strong>
        </div>
        <div className="now-grid">
          {workMap.map((item) => {
            const Icon = item.icon;
            return (
              <div className="now-cell" key={item.title}>
                <Icon aria-hidden="true" />
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        className="wide-section proof-section"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        <div className="section-index">
          <span>02</span>
          <strong>做了什么成果</strong>
        </div>
        <div className="proof-grid">
          <a className="proof-card" href="/achievements">
            <Trophy aria-hidden="true" />
            <span>Achievement file</span>
            <strong>{achievements.length > 0 ? achievements[0].title : "成果档案待补全"}</strong>
            <p>{achievements.length > 0 ? achievements[0].description : "这里会放可验证的数据、截图、证明链接和阶段性结果。"}</p>
          </a>
          <a className="proof-card" href="/projects">
            <FolderKanban aria-hidden="true" />
            <span>Project file</span>
            <strong>{projects.length > 0 ? projects[0].title : "项目档案待补全"}</strong>
            <p>{projects.length > 0 ? projects[0].description : "这里会放正在推进的系统、产品原型、流程图和复盘。"}</p>
          </a>
        </div>
      </motion.section>

      <motion.section
        className="wide-section timeline-section"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        <div className="section-index">
          <span>03</span>
          <strong>最近的路标</strong>
        </div>
        <div className="timeline-flow">
          {timeline.map((item) => (
            <a className="flow-item" href={item.href} key={`${item.type}-${item.slug}`}>
              <span>{formatDateDot(item.date)}</span>
              <strong>{item.title}</strong>
              <em>{item.type}</em>
            </a>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="wide-section essays-section"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        <div className="section-index">
          <span>04</span>
          <strong>最新思考</strong>
        </div>
        <div className="dense-list">
          {essays.map((post) => (
            <a href={`/essays/${post.slug}/`} key={post.slug}>
              <span>{formatDateDot(post.date)}</span>
              <strong>{post.title}</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
      </motion.section>

      <motion.section
        className="wide-section log-section"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.45 }}
      >
        <div className="section-index">
          <span>05</span>
          <strong>过程记录</strong>
        </div>
        <div className="log-copy">
          <p>日记像路上的灰尘，不一定漂亮，但能证明自己真的走过。</p>
          <div>
            {diaries.map((post) => (
              <a href={`/diaries/${post.slug}/`} key={post.slug}>{formatDateDot(post.date)}</a>
            ))}
            <a href="/diaries">进入日记</a>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
