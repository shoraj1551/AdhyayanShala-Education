export interface NewsItem {
  id: string;
  title: string;
  date: string;
  type: "Workshop" | "Course" | "Notice";
  desc: string;
  fullContent: string;
  registerLink?: string;
  registerLabel?: string;
  price?: string;
}

export const newsData: NewsItem[] = [
  {
    id: "ai-workshop-2026",
    title: "AI in Education Workshop",
    date: "March 15, 2026",
    type: "Workshop",
    desc: "Join us for a deep dive into how AI is transforming the classroom environment.",
    price: "₹499",
    fullContent: `
      <h2>Transforming Classrooms with Artificial Intelligence</h2>
      <p>Artificial Intelligence is no longer just a futuristic concept—it's here, and it's reshaping how we teach and learn. In this immersive workshop, educators, administrators, and tech enthusiasts will explore the practical applications of AI in modern education.</p>
      
      <h3>What You'll Learn:</h3>
      <ul>
        <li><strong>Personalized Learning:</strong> How AI algorithms adapt to student needs in real-time.</li>
        <li><strong>Automated Grading:</strong> Tools that free up teacher time for more meaningful interactions.</li>
        <li><strong>Predictive Analytics:</strong> Identifying at-risk students before they fall behind.</li>
        <li><strong>Ethics in AI:</strong> Navigating privacy and bias in educational tools.</li>
      </ul>
      
      <p>This session will feature guest speakers from leading EdTech companies and hands-on demonstrations of the latest tools.</p>
      <p>Don't miss this opportunity to be at the forefront of educational innovation.</p>
    `,
    registerLink: "/explore?category=workshop",
    registerLabel: "Register for Workshop"
  },
  {
    id: "python-course-launch",
    title: "New Python Course Launch",
    date: "April 02, 2026",
    type: "Course",
    desc: "Our comprehensive Python for Data Science course goes live next month!",
    price: "₹2999",
    fullContent: `
      <h2>Master Python for Data Science</h2>
      <p>Data is the new oil, and Python is the drill. We are thrilled to announce the launch of our comprehensive <strong>Python for Data Science</strong> course, designed to take you from a beginner to a data wizard.</p>

      <h3>Course Highlights:</h3>
      <ul>
        <li><strong>Zero to Hero:</strong> No prior programming experience required.</li>
        <li><strong>Hands-on Projects:</strong> Build real-world applications including a price predictor and a recommendation engine.</li>
        <li><strong>Libraries Covered:</strong> Pandas, NumPy, Matplotlib, Seaborn, and Scikit-learn.</li>
        <li><strong>Career Support:</strong> Resume reviews and mock interviews upon completion.</li>
      </ul>

      <p>Whether you're looking to pivot your career or upskill for your current role, this course provides the foundation you need to succeed in the data-driven economy.</p>
    `,
    registerLink: "/explore",
    registerLabel: "Enroll Now"
  },
  {
    id: "instructor-applications",
    title: "Instructor Program Applications",
    date: "Open Now",
    type: "Notice",
    desc: "We are looking for passionate educators to join our team. Apply today.",
    fullContent: `
      <h2>Become an Instructor at AdhyayanShala</h2>
      <p>Are you an expert in your field? Do you have a passion for sharing knowledge? AdhyayanShala is expanding, and we are looking for talented instructors to join our global community of educators.</p>

      <h3>Why Teach with Us?</h3>
      <ul>
        <li><strong>Global Reach:</strong> Impact students from over 50 countries.</li>
        <li><strong>Flexible Schedule:</strong> Create content at your own pace.</li>
        <li><strong>Competitive Revenue Share:</strong> Earn significantly from your courses.</li>
        <li><strong>Support & Tools:</strong> Access our proprietary course creation toolkit and dedicated support team.</li>
      </ul>

      <p>We are currently seeking experts in Web Development, Digital Marketing, Cloud Computing, and Creative Arts. If you have the knowledge, we have the platform.</p>
    `,
    registerLink: "/instructor/register",
    registerLabel: "Apply to become an Instructor"
  }
];
