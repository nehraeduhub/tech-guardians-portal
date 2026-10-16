import courseWebHosting from '@/assets/course-web-hosting.jpg';
import courseSophosFirewall from '@/assets/course-sophos-firewall.jpg';
import courseActiveDirectory from '@/assets/course-active-directory.jpg';
import courseAiAgentBuild from '@/assets/course-ai-agent-build.jpg';
import coursePasswordCracking from '@/assets/course-password-cracking.jpg';
import courseSocialAndroid from '@/assets/course-social-android.jpg';

export const courseVisuals = [courseWebHosting, courseSophosFirewall, courseActiveDirectory, courseAiAgentBuild, coursePasswordCracking, courseSocialAndroid] as const;

export const ENROLL_URL = '/courses/payment.html';

export const coursePageMap: Record<string, string> = {
  'web server': '/courses/web-server-hosting.html',
  'sophos firewall': '/courses/sophos-firewall.html',
  'active directory': '/courses/active-directory.html',
  'ai agent': '/courses/ai-agent.html',
  'password cracking': '/courses/password-cracking.html',
  'social media': '/courses/social-android-hacking.html',
  'android hacking': '/courses/social-android-hacking.html',
};

export const fallbackBlogPosts = [
  {
    id: 'fallback-1',
    title: 'How students can build cyber safety habits in just 15 minutes a week',
    slug: 'students-cyber-safety-habits',
    excerpt:
      'A simple routine for students to strengthen passwords, spot phishing, secure devices, and stay safer online without feeling overwhelmed.',
    content:
      'Cyber safety does not need to start with advanced hacking tools. It starts with repeatable habits. At Tech Guardians, we recommend a weekly 15-minute cyber check-in. In the first five minutes, review your passwords and update any that are weak or reused. In the next five, check recent app permissions, active devices, and browser extensions. In the final five, read one short case study about a recent scam, phishing trick, or social engineering attack.\n\nThis rhythm helps students build awareness before they ever enter a lab. It also creates the mindset needed for ethical hacking, forensics, and investigation work later. Strong cyber professionals are not only technically skilled; they are observant, disciplined, and consistent.',
    cover_image: courseWebHosting,
    is_published: true,
    published_at: '2026-03-08T10:00:00.000Z',
  },
  {
    id: 'fallback-2',
    title: 'What schools should include in a modern cyber awareness programme',
    slug: 'modern-school-cyber-awareness-programme',
    excerpt:
      'From safe browsing to digital rights, these are the practical topics schools and colleges should cover in every awareness session.',
    content:
      'A strong awareness programme should go beyond generic warnings. Students, staff, and parents need practical examples tied to their daily digital life. That means recognising fake job links, protecting school accounts, understanding privacy settings, avoiding financial scams, and responding correctly when a device is compromised.\n\nThe best awareness sessions are interactive. Instead of only presenting slides, institutions should include Q&A moments, realistic examples, and action checklists that participants can use immediately. This is where Tech Guardians focuses its delivery: expert-led, relevant, and designed for the Indian digital environment.',
    cover_image: courseSophosFirewall,
    is_published: true,
    published_at: '2026-03-05T10:00:00.000Z',
  },
  {
    id: 'fallback-3',
    title: 'Why AI and cybersecurity now belong in the same classroom',
    slug: 'ai-and-cybersecurity-same-classroom',
    excerpt:
      'AI is changing detection, automation, and analysis, so cyber learners now need both security fundamentals and AI literacy.',
    content:
      'AI is becoming part of cyber defense, threat detection, anomaly analysis, and response workflows. But learners should not skip the basics. Networking, operating systems, digital hygiene, and investigation logic remain essential foundations.\n\nThe real opportunity is combining both worlds. Students who understand cyber fundamentals and can work with AI tools will be able to build faster investigation workflows, automate repetitive tasks, and interpret alerts with much stronger context. That blend is exactly why AI now deserves a place inside every future-ready cyber curriculum.',
    cover_image: courseAiAgentBuild,
    is_published: true,
    published_at: '2026-03-02T10:00:00.000Z',
  },
] as const;
