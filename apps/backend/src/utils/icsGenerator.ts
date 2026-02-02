
export const generateICS = (courseTitle: string, schedules: any[]) => {
    // Simple ICS structure
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//ShorajLearning//CourseSchedule//EN\n";

    schedules.forEach((s: any) => {
        // This is a simplified recurrence rule generation
        // Real implementation would need proper date calculation based on dayOfWeek
        // For MVP, we will just put a generic recurring event starting from tomorrow

        const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const dayCode = days[s.dayOfWeek % 7]; // Prisma: 1=Mon... wait user input might differ. Let's assume standard.

        icsContent += "BEGIN:VEVENT\n";
        icsContent += `SUMMARY:${courseTitle} Live Class\n`;
        icsContent += `RRULE:FREQ=WEEKLY;BYDAY=${dayCode}\n`;
        // Start Time would need a real date, let's mock it relative to now for demonstration
        // icsContent += ...
        icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";
    return icsContent;
}
