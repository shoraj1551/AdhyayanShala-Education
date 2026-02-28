export const DEFAULT_STUDENT_STATUSES = [
    { value: "school", label: "School Student" },
    { value: "college", label: "College Student" },
    { value: "competitive", label: "Exam Aspirant" },
    { value: "professional", label: "Working Professional" },
    { value: "other", label: "Lifelong Learner" }

];

export const STUDENT_SUB_OPTIONS: Record<string, { label: string, options: { value: string, label: string }[] }> = {
    school: {
        label: "Current Grade",
        options: [
            { value: "class_9", label: "Class 9" },
            { value: "class_10", label: "Class 10" },
            { value: "class_11_sci", label: "Class 11 (Science)" },
            { value: "class_11_com", label: "Class 11 (Commerce)" },
            { value: "class_11_arts", label: "Class 11 (Arts)" },
            { value: "class_12_sci", label: "Class 12 (Science)" },
            { value: "class_12_com", label: "Class 12 (Commerce)" },
            { value: "class_12_arts", label: "Class 12 (Arts)" },
        ]
    },
    college: {
        label: "Current Year / Course",
        options: [
            { value: "1st_year", label: "Undergraduate (1st Year)" },
            { value: "2nd_year", label: "Undergraduate (2nd Year)" },
            { value: "3rd_year", label: "Undergraduate (3rd Year)" },
            { value: "4th_year", label: "Undergraduate (4th Year)" },
            { value: "masters", label: "Masters / Post Graduate" },
            { value: "graduate", label: "Completed / Alumni" },
        ]
    },

    competitive: {
        label: "Focus Exam",
        options: [
            { value: "jee", label: "JEE (Engineering)" },
            { value: "neet", label: "NEET (Medical)" },
            { value: "upsc", label: "UPSC / Civil Services" },
            { value: "ssc", label: "SSC / Banking / Govt" },
            { value: "gate", label: "GATE / Higher Studies" },
            { value: "cat", label: "CAT / Management" },
            { value: "other", label: "Other Entrance Exams" },
        ]
    },
    professional: {
        label: "Career Stage",
        options: [
            { value: "entry", label: "Entry Level (0-2 Years)" },
            { value: "mid", label: "Mid-Career (3-7 Years)" },
            { value: "senior", label: "Senior Level (7+ Years)" },
            { value: "transition", label: "Career Transitioning" },
        ]
    }

};

export const DEFAULT_INTERESTS = [
    // ...

    { value: "development", label: "Web Development" },
    { value: "datascience", label: "Data Science" },
    { value: "design", label: "Design & Creative" },
    { value: "business", label: "Business & Marketing" },
    { value: "cloud", label: "Cloud Computing" },
    { value: "cybersecurity", label: "Cybersecurity" },
    { value: "ai", label: "Artificial Intelligence" },
    { value: "academics", label: "K-12 Academics" },
    { value: "languages", label: "Languages" }
];

export const INSTRUCTOR_EXPERTISE_OPTIONS = [
    { value: "software", label: "Software Development" },
    { value: "data", label: "Data Science & Analytics" },
    { value: "buesiness", label: "Business & Entrepreneurship" },
    { value: "design", label: "Design & Art" },
    { value: "marketing", label: "Marketing" },
    { value: "academics", label: "Academic Subjects (Math, Science, etc.)" },
    { value: "music", label: "Music & Audio" },
    { value: "health", label: "Health & Fitness" }
];
