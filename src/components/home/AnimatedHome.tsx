import { motion, useScroll, useSpring } from "framer-motion";
import {
  ArrowDown,
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

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

const workMap = [
  { title: "AI 产品化", text: "把模型能力变成真实可用的工具、流程和产品原型。", icon: Brain },
  { title: "内容系统", text: "从问题、选题、写作、发布到复盘，沉淀可重复的表达链路。", icon: BookOpen },
  { title: "自动化工作流", text: "把重复动作交给系统，把注意力留给判断和创造。", icon: Route },
  { title: "个人商业模式", text: "围绕自由、现金流、长期能力和真实需求持续实验。", icon: CircleDot },
];

function StorySection({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      id={id}
      className={`story-section ${className}`}
      variants={sectionReveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.55, ease: "easeOut" }}
    >
      <div className="story-heading">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

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
    <div className="story-home">
      <motion.div className="scroll-progress" style={{ scaleX }} />

      <section className="story-hero" id="top">
        <motion.div
          className="hero-intro"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="story-kicker">Wenxuan road / building in public</span>
          <h1>文轩的自由之路</h1>
          <p>
            我在用 AI、内容和产品实验，搭建自己的自由之路。这里记录我正在做什么，做出了什么，以及一路走来的思考。
          </p>
          <blockquote>
            世上本没有路，走的人多了，也便成了路。我的自由之路也是这样：先走，再记录。
          </blockquote>
        </motion.div>

        <motion.a
          className="scroll-cue"
          href="#now"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
          aria-label="继续向下阅读"
        >
          <span>Scroll</span>
          <ArrowDown aria-hidden="true" />
        </motion.a>
      </section>

      <StorySection id="now" eyebrow="01 / Now" title="我正在做什么">
        <div className="story-lines">
          {workMap.map((item) => {
            const Icon = item.icon;
            return (
              <article className="story-line" key={item.title}>
                <Icon aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </StorySection>

      <StorySection id="proof" eyebrow="02 / Proof" title="做过什么成果" className="proof-story">
        <div className="proof-stack">
          <a className="proof-feature" href="/achievements">
            <Trophy aria-hidden="true" />
            <span>Achievement</span>
            <strong>{achievements.length > 0 ? achievements[0].title : "成果档案待补全"}</strong>
            <p>{achievements.length > 0 ? achievements[0].description : "这里会放可验证的数据、截图、证明链接和阶段性结果。"}</p>
          </a>
          <a className="proof-feature quiet" href="/projects">
            <FolderKanban aria-hidden="true" />
            <span>Project</span>
            <strong>{projects.length > 0 ? projects[0].title : "项目档案待补全"}</strong>
            <p>{projects.length > 0 ? projects[0].description : "这里会放正在推进的系统、产品原型、流程图和复盘。"}</p>
          </a>
        </div>
      </StorySection>

      <StorySection id="timeline" eyebrow="03 / Timeline" title="最近留下的路标">
        <div className="road-timeline">
          {timeline.map((item) => (
            <a className="road-node" href={item.href} key={`${item.type}-${item.slug}`}>
              <time>{formatDateDot(item.date)}</time>
              <strong>{item.title}</strong>
              <span>{item.type}</span>
            </a>
          ))}
        </div>
      </StorySection>

      <StorySection id="essays" eyebrow="04 / Essays" title="最新思考">
        <div className="essay-stream">
          {essays.map((post) => (
            <a href={`/essays/${post.slug}/`} key={post.slug}>
              <time>{formatDateDot(post.date)}</time>
              <strong>{post.title}</strong>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
      </StorySection>

      <StorySection id="logs" eyebrow="05 / Logs" title="过程记录">
        <div className="log-ending">
          <p>日记像路上的灰尘，不一定漂亮，但能证明自己真的走过。</p>
          <div>
            {diaries.map((post) => (
              <a href={`/diaries/${post.slug}/`} key={post.slug}>{formatDateDot(post.date)}</a>
            ))}
            <a href="/diaries">进入日记</a>
          </div>
        </div>
      </StorySection>
    </div>
  );
}
