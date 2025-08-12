import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function About() {
  const skills = [
    "Education", "Content Creation", "Storytelling", "Workshops", 
    "Course Development", "Public Speaking", "Writing", "Mentoring"
  ]

  const achievements = [
    {
      title: "Educational Impact",
      description: "Taught and mentored hundreds of students",
      year: "2020-Present"
    },
    {
      title: "Content Creation",
      description: "Published numerous articles and stories",
      year: "2019-Present"
    },
    {
      title: "Workshop Facilitation",
      description: "Conducted workshops on various topics",
      year: "2021-Present"
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          About Shoraj Tomer
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Educator, Storyteller, and Content Creator
        </p>
      </div>

      <div className="space-y-12">
        {/* Bio Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">My Story</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                Welcome to my digital space! I'm Shoraj Tomer, a passionate educator and storyteller 
                who believes in the transformative power of knowledge and creativity. My journey began 
                with a simple belief: everyone deserves access to quality education and inspiring content.
              </p>
              <p>
                Through this platform, I share my knowledge, experiences, and stories with learners 
                from all walks of life. Whether it's through in-depth courses, engaging workshops, 
                thought-provoking blog posts, or creative stories, my goal is to inspire, educate, 
                and empower individuals to reach their full potential.
              </p>
              <p>
                I believe that learning should be accessible, engaging, and meaningful. That's why 
                I've created this comprehensive platform that offers various ways to learn and grow, 
                from traditional educational content to creative storytelling and interactive experiences.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Skills Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Skills & Expertise</CardTitle>
              <CardDescription>
                Areas where I can help you grow and learn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Achievements Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Key Achievements</CardTitle>
              <CardDescription>
                Milestones in my educational and creative journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {achievements.map((achievement, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{achievement.title}</h3>
                      <Badge variant="outline">{achievement.year}</Badge>
                    </div>
                    <p className="text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mission Section */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">My Mission</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-lg max-w-none">
              <p>
                To create a world where learning is accessible, engaging, and transformative. 
                Through this platform, I aim to:
              </p>
              <ul>
                <li>Provide high-quality educational content that makes complex topics understandable</li>
                <li>Tell stories that inspire, entertain, and teach valuable life lessons</li>
                <li>Offer interactive learning experiences through courses and workshops</li>
                <li>Build a community of lifelong learners who support each other's growth</li>
                <li>Make education affordable and accessible to everyone, regardless of background</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}